/**
 * cx — join class fragments, dropping falsy ones.
 *
 * The single shared className combiner for the whole app (previously hand-
 * redefined in ~19 files). No `clsx`/`tailwind-merge` dependency: a plain
 * filter-and-join, identical to every local copy it replaces.
 *
 * @example cx("base", isActive && "active", undefined) // → "base active"
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
