import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Navbar, type NavbarItem } from "./Navbar";

/* ---- Nav glyphs (consumer-provided icons; the navbar owns only the Logo). --- */
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1v-7.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const items: NavbarItem[] = [
  { key: "library", label: "Library", icon: <HomeIcon />, href: "/library" },
  { key: "search", label: "Search", icon: <SearchIcon />, href: "/search" },
  { key: "saved", label: "Saved", icon: <BookmarkIcon />, href: "/saved" },
];

const user = { name: "Karina Aguilar" };

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  parameters: { layout: "fullscreen" },
  args: { items, user, activeKey: "library" },
  decorators: [
    (Story) => (
      <div className="bg-canvas p-[var(--space-xl)]">
        <div className="mx-auto max-w-[820px]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Library active — the default landing state. */
export const LibraryActive: Story = {};

/** Search active. */
export const SearchActive: Story = { args: { activeKey: "search" } };

/** Saved active, with a count badge on the Saved item. */
export const SavedActiveWithBadge: Story = {
  args: {
    activeKey: "saved",
    items: items.map((i) => (i.key === "saved" ? { ...i, badge: 1 } : i)),
  },
};

/** No active item (e.g. a route outside the three sections). */
export const NoneActive: Story = { args: { activeKey: undefined } };

/** Avatar with a loaded image rather than initials. */
export const WithAvatarImage: Story = {
  args: {
    user: {
      name: "Karina Aguilar",
      avatarSrc: "https://i.pravatar.cc/80?img=47",
    },
  },
};

/**
 * SPA mode — `onNavigate` makes items `<button>`s instead of links. Click logs
 * the key in the Actions panel.
 */
export const SPAButtons: Story = {
  args: {
    onNavigate: (key: string) => console.log("navigate:", key),
    onAccountClick: () => console.log("account"),
  },
};

/**
 * Mobile variant — same component in a narrow container. Inactive items collapse
 * to icon-only squares; the active item keeps its label + pill; Logo stays left.
 */
export const Mobile: Story = {
  args: { activeKey: "library" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  decorators: [
    (Story) => (
      <div className="bg-canvas p-[var(--space-md)]">
        <div className="mx-auto max-w-[360px]">
          <Story />
        </div>
      </div>
    ),
  ],
};
