/**
 * Figma Code Connect mapping for Avatar.
 *
 * NOTE: the live Figma connection for this session only surfaced the 📚 Cover
 * page; the Components/Screens pages (where the real Avatar component and its
 * Navbar/UserCard instances live) were not reachable, so the node-id below is a
 * PLACEHOLDER to be reconciled against the live "Avatar" component set. The
 * variant → prop model mirrors the design-lead spec:
 *   size: SM | MD | LG -> "sm" | "md" | "lg"
 *   image fill         -> src
 *   name / initials    -> name
 *
 * `@figma/code-connect` is not yet a project dependency and these files are
 * compiled by the Figma `code-connect` CLI, not the app `tsc` build (they are
 * excluded in tsconfig.json). Add the devDependency + `figma.config.json`, then
 * re-point the URL to publish this mapping.
 */
import figma from "@figma/code-connect";
import { Avatar } from "./Avatar";

figma.connect(
  Avatar,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=0-0",
  {
    props: {
      size: figma.enum("size", { SM: "sm", MD: "md", LG: "lg" }),
      name: figma.string("name"),
    },
    example: ({ size, name }) => <Avatar size={size} name={name} />,
  },
);
