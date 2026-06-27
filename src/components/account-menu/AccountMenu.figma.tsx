/**
 * Figma Code Connect mapping for AccountMenu → Figma node 357:629
 * ("Overlay / UserCard", card 340:620, file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and this file is
 * compiled by the Figma `code-connect` CLI, not the app `tsc` build (excluded in
 * tsconfig.json). Add the devDependency + `figma.config.json` to publish.
 *
 * The Figma overlay is a static composition (no exposed variant props): a fixed
 * identity header, a two-tile stats row, the ES/FR/PT language pills, and a
 * neutral Sign-out button. The example wires representative props so a developer
 * sees the open-state contract — `open`/`onClose`/`onViewProfile`/`onSignOut`
 * are owned by the consuming Navbar.
 */
import figma from "@figma/code-connect";
import { AccountMenu } from "./AccountMenu";

figma.connect(
  AccountMenu,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=357-629",
  {
    example: () => (
      <AccountMenu
        open
        onClose={() => {}}
        identity={{
          name: "Karina Aguilar",
          email: "karina@example.com",
        }}
        stats={{ words: 0, finished: 0 }}
        translationLang="ES"
        onTranslationLangChange={() => {}}
        onViewProfile={() => {}}
        onSignOut={() => {}}
      />
    ),
  },
);
