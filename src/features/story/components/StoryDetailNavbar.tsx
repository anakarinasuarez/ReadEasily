"use client";

import { Navbar, type NavbarItem } from "@/components/navbar";
import { useNavbarAccount } from "@/hooks/useNavbarAccount";
import { LibraryIcon, SavedIcon, SearchIcon } from "./icons";

/**
 * The Story-Detail navbar — a client island. The surrounding page content is a
 * Server Component; only this (the account menu + auth-aware affordance) needs
 * to ship JS. Library is active (the breadcrumb-back target).
 */
const NAV_ITEMS: NavbarItem[] = [
  { key: "library", label: "Library", icon: <LibraryIcon />, href: "/library" },
  { key: "search", label: "Search", icon: <SearchIcon />, href: "/search" },
  { key: "saved", label: "Saved", icon: <SavedIcon />, href: "/saved" },
];

export function StoryDetailNavbar() {
  const navbar = useNavbarAccount({ name: "Reader" });
  return (
    <div className="sticky top-0 z-50 mx-auto w-full max-w-7xl px-lg pt-lg">
      <Navbar items={NAV_ITEMS} activeKey="library" {...navbar} />
    </div>
  );
}
