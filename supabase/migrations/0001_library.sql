-- ============================================================================
-- 0001_library.sql — Library catalog schema (books, categories, sections)
--
-- Forward-only migration. Rebuildable from zero. This is the real backend the
-- mock /api/library handler stands in for today; the shape mirrors
-- src/features/library/types.ts (LibraryData) so getLibrary() can swap its
-- fetch body for Supabase queries without changing its signature.
--
-- The catalog is PUBLIC CONTENT (stories anyone can browse). RLS is ON for
-- every table (default-deny is the baseline), and we add EXPLICIT read-only
-- policies for anon + authenticated. There are deliberately NO insert/update/
-- delete policies: under RLS that means writes are denied for every client
-- role. Catalog content is curated through the service_role key (server-side
-- ingest/admin), which bypasses RLS. A `USING (true)` *write* policy would be
-- the bug this guards against — a public mutation surface on shared content.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- categories — filter chips. `id` is a stable human slug (e.g. 'fables').
-- The 'all' sentinel chip is a client-side concern (see types.ts), NOT a row.
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id    text primary key,
  label text not null,
  -- Display order of the chips after the client-side 'All' sentinel.
  position int not null default 0
);

-- ---------------------------------------------------------------------------
-- books — one row per story. Columns map 1:1 to the Book/FeaturedBook contract.
-- The featured hero is just the row where is_featured = true (enforced unique
-- below so there is exactly one). showcase_covers lives on the featured row.
-- ---------------------------------------------------------------------------
create table if not exists public.books (
  id          text primary key,                     -- slug; also the /read/:id route param
  title       text not null,
  -- CEFR band, constrained to the contract's Level union.
  level       text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  level_label text,                                  -- human label, e.g. 'Elementary' (featured)
  minutes     int  not null check (minutes > 0),
  words       int  check (words is null or words >= 0),
  cover_src   text not null,                         -- Storage URL (optimized WebP today)
  category    text not null references public.categories (id) on delete restrict,
  teaser      text,                                  -- featured hook copy
  badge_label text,                                  -- featured pill, e.g. "Editor's pick"
  is_featured boolean not null default false,
  -- Showcase carousel covers; only meaningful on the featured row.
  showcase_covers text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- Exactly one featured hero at a time. Partial unique index over the constant
-- `true` lets only a single is_featured row exist while leaving the rest free.
create unique index if not exists books_single_featured
  on public.books ((is_featured)) where is_featured;

create index if not exists books_category_idx on public.books (category);

-- ---------------------------------------------------------------------------
-- catalog_sections — the ordered shelves on the Library landing.
-- `position` drives display order; a row id = 'continue' sorts first by
-- convention (give it the lowest position), matching LibraryData.sections.
-- ---------------------------------------------------------------------------
create table if not exists public.catalog_sections (
  id       text primary key,                         -- 'continue' | 'fables' | ...
  title    text not null,
  subtitle text not null,
  position int  not null default 0
);

-- ---------------------------------------------------------------------------
-- section_books — many-to-many join giving each section its ordered books.
-- A book can appear in more than one shelf (e.g. a fable also in 'continue');
-- `position` orders books within a section.
-- ---------------------------------------------------------------------------
create table if not exists public.section_books (
  section_id text not null references public.catalog_sections (id) on delete cascade,
  book_id    text not null references public.books (id)            on delete cascade,
  position   int  not null default 0,
  primary key (section_id, book_id)
);

create index if not exists section_books_section_idx
  on public.section_books (section_id, position);

-- ============================================================================
-- Row Level Security — ON everywhere; public read, no public write.
-- Threat defended: a client (anon or signed-in) tampering with shared catalog
-- content, or reading nothing because RLS-on-without-policy is default-deny.
-- ============================================================================
alter table public.categories       enable row level security;
alter table public.books            enable row level security;
alter table public.catalog_sections enable row level security;
alter table public.section_books    enable row level security;

-- Public read: the catalog is meant to be browsable by everyone, including
-- logged-out visitors. SELECT only — to anon and authenticated.
create policy categories_public_read on public.categories
  for select to anon, authenticated using (true);

create policy books_public_read on public.books
  for select to anon, authenticated using (true);

create policy catalog_sections_public_read on public.catalog_sections
  for select to anon, authenticated using (true);

create policy section_books_public_read on public.section_books
  for select to anon, authenticated using (true);

-- No INSERT/UPDATE/DELETE policies by design: writes are denied for anon and
-- authenticated and only happen via service_role (server-side curation).
