import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Modal, type ModalSize } from "./Modal";
import { Button } from "../../ui/button";

/** Bookmark glyph — the practice modal's primary "Save to practice later" CTA. */
function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4h12v16l-6-4-6 4V4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Refresh glyph — "New sentences" secondary action. */
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 4v4h-4M4 20v-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A handful of practice sentences to fill (and overflow) the modal body. */
const SENTENCES = [
  ["The path through the forest is very beautiful in autumn.", "El sendero a través del bosque es muy hermoso en otoño."],
  ["I walk the same path to work every morning.", "Camino por el mismo camino al trabajo cada mañana."],
  ["Be careful! There is a big hole in the path ahead.", "¡Ten cuidado! Hay un agujero grande en el camino adelante."],
  ["The hiking path starts behind the old church.", "El sendero de senderismo comienza detrás de la iglesia antigua."],
  ["My daughter rode her bike down the garden path.", "Mi hija anduvo en bicicleta por el sendero del jardín."],
];

function SentenceList() {
  return (
    <ol className="flex flex-col gap-[var(--space-md)]">
      {SENTENCES.map(([en, es], i) => (
        <li
          key={i}
          className="flex gap-[var(--space-md)] rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] px-[var(--space-lg)] py-[var(--space-md)]"
        >
          <span className="text-[var(--text-accent)] [font-family:var(--text-label-m-family)] [font-size:var(--text-label-m-size)]">
            {i + 1}
          </span>
          <div className="flex flex-col gap-[var(--space-xs)]">
            <p className="text-[var(--text-primary)] [font-family:var(--text-reading-m-family)] [font-size:var(--text-reading-m-size)] [line-height:var(--text-reading-m-line-height)]">
              {en}
            </p>
            <p className="text-[var(--text-muted)] [font-family:var(--text-ui-m-family)] [font-size:var(--text-ui-m-size)]">
              {es}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Stateful harness — the Modal is controlled, so stories own `open`. */
function ModalDemo({
  size,
  dismissible,
  body = "list",
  withFooter = true,
}: {
  size?: ModalSize;
  dismissible?: boolean;
  body?: "list" | "loading" | "empty" | "error";
  withFooter?: boolean;
}) {
  const [open, setOpen] = useState(true);

  const footer = withFooter ? (
    <>
      <Button variant="secondary" leftIcon={<RefreshIcon />} onClick={() => setOpen(true)}>
        New sentences
      </Button>
      <Button variant="primary" leftIcon={<BookmarkIcon />} onClick={() => setOpen(false)}>
        Save to practice later
      </Button>
    </>
  ) : undefined;

  return (
    <div className="flex min-h-[640px] items-center justify-center">
      <Button onClick={() => setOpen(true)}>Open practice modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        size={size}
        dismissible={dismissible}
        eyebrow="Practice · 10 sentences"
        title="Path"
        meta="sendero, camino"
        footer={footer}
      >
        {body === "list" && <SentenceList />}
        {body === "loading" && <Modal.Skeleton rows={4} />}
        {body === "empty" && (
          <Modal.Empty>
            <p className="[font-family:var(--text-heading-h4-family)] [font-size:var(--text-heading-h4-size)] text-[var(--text-primary)]">
              No sentences yet
            </p>
            <p>Generate a set to start practising this word.</p>
          </Modal.Empty>
        )}
        {body === "error" && (
          <Modal.Error>
            We couldn’t load your practice set. Check your connection and try again.
          </Modal.Error>
        )}
      </Modal>
    </div>
  );
}

const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
  // The Modal is controlled; every story drives `open` from its own harness via
  // `render`, so these required-prop defaults exist only to satisfy the types.
  args: {
    open: false,
    onOpenChange: () => {},
    title: "Path",
    children: null,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The canonical practice modal: eyebrow + title + meta, body, footer actions. */
export const Default: Story = {
  render: () => <ModalDemo />,
};

export const Small: Story = {
  render: () => <ModalDemo size="sm" />,
};

export const Large: Story = {
  render: () => <ModalDemo size="lg" />,
};

/** Loading body — token-bound skeleton, never a blank modal. */
export const LoadingBody: Story = {
  render: () => <ModalDemo body="loading" withFooter={false} />,
};

/** Empty body — a friendly message instead of nothing. */
export const EmptyBody: Story = {
  render: () => <ModalDemo body="empty" withFooter={false} />,
};

/** Error body — inline, role=alert, lives inside the modal. */
export const ErrorBody: Story = {
  render: () => <ModalDemo body="error" />,
};

/** Non-dismissible — Esc, scrim and the close button are all suppressed. */
export const NonDismissible: Story = {
  render: () => <ModalDemo dismissible={false} />,
};
