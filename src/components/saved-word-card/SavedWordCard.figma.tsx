/**
 * Figma Code Connect mapping for SavedWordCard → Figma node 1135:2637
 * (file sc9DIhX0wvFgrvmL8NVBf5, "Saved Word Card", badge variant; the
 * phonetic variant is 1136:3177).
 *
 * NOTE: `@figma/code-connect` (^1.4.8) + `figma.config.json` are now in place, so
 * these files are parsed and published by the Figma `code-connect` CLI
 * (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (they stay
 * excluded in tsconfig.json). Server-publish also needs FIGMA_ACCESS_TOKEN + a
 * paid Dev/Full seat (read-figma skill) — `figma:parse` validates locally first.
 *
 * Figma models the whole card as one <a> wrapping the buttons. The code does
 * NOT (it would nest interactive elements). The mapping therefore exposes the
 * data props only; navigation + the audio/remove/practice handlers are wired
 * by the consuming feature, not by the static design.
 */
import figma from "@figma/code-connect";
import { SavedWordCard } from "./SavedWordCard";

figma.connect(
  SavedWordCard,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1135-2637",
  {
    props: {
      word: figma.string("word"),
      phonetic: figma.string("phonetic"),
      translation: figma.string("translation"),
      sourceStoryTitle: figma.string("source"),
      // Figma stores the badge copy as text (e.g. "10 sentences ready"); the
      // primitive derives the badge + Review/Practice label from this count.
      sentencesReady: figma.string("sentences"),
    },
    example: ({ word, phonetic, translation, sourceStoryTitle }) => (
      <SavedWordCard
        word={word}
        phonetic={phonetic}
        translation={translation}
        sourceStoryTitle={sourceStoryTitle}
        sentencesReady={10}
        wordHref="#"
        onListen={() => {}}
        onRemove={() => {}}
      />
    ),
  },
);
