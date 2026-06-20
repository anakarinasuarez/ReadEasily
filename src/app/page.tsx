/**
 * Token smoke-test page. Consumes generated design tokens via Tailwind utilities
 * (bg-canvas, text-muted, bg-accent-strong, rounded-pill, shadow-sm, font-display)
 * to prove the tokens -> Tailwind wiring end to end. Real screens replace this.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-xl bg-canvas px-lg py-3xl">
      <section className="flex w-full max-w-md flex-col gap-md rounded-lg bg-surface-elevated p-xl shadow-sm">
        <h1 className="font-display text-primary [font-size:var(--text-display-l)] [line-height:var(--text-display-l-line-height)]">
          ReadEasily
        </h1>
        <p className="font-reading text-secondary [font-size:var(--text-reading-m)] [line-height:var(--text-reading-m-line-height)]">
          Learn English through short illustrated stories.
        </p>
        <p className="font-ui text-muted [font-size:var(--text-ui-m)]">
          Tokens are generated from Figma Foundations.
        </p>
        <button
          type="button"
          className="mt-sm inline-flex items-center justify-center gap-sm rounded-pill bg-accent-strong px-xl py-md font-ui font-semibold text-on-accent"
        >
          Start reading
        </button>
      </section>
    </main>
  );
}
