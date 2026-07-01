/**
 * Figma Code Connect mapping for Avatar.
 *
 * NOTE: the live Figma connection for this session only surfaced the 📚 Cover
 * page; the Components/Screens pages (where the real Avatar component and its
 * Navbar/UserCard instances live) were not reachable, so the node-id below is a
 * PLACEHOLDER to be reconciled against the live "Avatar" component set. The
 * variant → prop model mirrors the design-lead spec:
 *   size: SM | MD | LG | XL -> "sm" | "md" | "lg" | "xl" (XL=120px, Profile header 149:242)
 *   image fill         -> src
 *   name / initials    -> name
 *
 * `@figma/code-connect` (^1.4.8) + `figma.config.json` are now in place, so
 * these files are parsed and published by the Figma `code-connect` CLI
 * (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (they stay
 * excluded in tsconfig.json). Re-point the URL off the placeholder, then publish
 * (needs FIGMA_ACCESS_TOKEN + a paid seat) to ship this mapping.
 */
import figma from "@figma/code-connect";
import { Avatar } from "./Avatar";

figma.connect(
  Avatar,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=0-0",
  {
    props: {
      size: figma.enum("size", { SM: "sm", MD: "md", LG: "lg", XL: "xl" }),
      name: figma.string("name"),
    },
    example: ({ size, name }) => <Avatar size={size} name={name} />,
  },
);
