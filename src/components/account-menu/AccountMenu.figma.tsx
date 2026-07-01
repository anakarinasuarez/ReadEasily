/**
 * Figma Code Connect mapping for AccountMenu → Figma node 357:629
 * ("Overlay / UserCard", card 340:620, file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` (^1.4.8) is now a devDependency and
 * `figma.config.json` configures the parser, so this file is parsed and
 * published by the Figma `code-connect` CLI (`npm run figma:parse` /
 * `figma:publish`), not the app `tsc` build (still excluded in tsconfig.json).
 * Publishing needs FIGMA_ACCESS_TOKEN + a paid seat.
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
