import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState } from "react";
import { AccountMenu, type AccountLang } from "./AccountMenu";
import { Avatar } from "../../ui/avatar";

/**
 * AccountMenu stories. The popover anchors to a trigger, so each story renders a
 * mock navbar-avatar button inside a `relative` box (as the real Navbar does)
 * and toggles `open`. The component is purely presentational: the language is a
 * controlled prop, so the `Harness` holds it in local state (in the app the
 * `useNavbarAccount` wiring binds it to the shared preferences store).
 */
const meta = {
  title: "Components/AccountMenu",
  component: AccountMenu,
  parameters: { layout: "fullscreen" },
  // Required-prop placeholders so each story can supply only a `render`; the
  // `Harness` below owns the real open/close + data wiring.
  args: {
    open: true,
    onClose: () => {},
    identity: { name: "Karina Aguilar" },
    stats: { words: 0, finished: 0 },
    translationLang: "ES",
    onTranslationLangChange: () => {},
    onViewProfile: () => {},
  },
} satisfies Meta<typeof AccountMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness({
  email,
  withSignOut = true,
  avatarSrc,
  words = 24,
  finished = 3,
}: {
  email?: string;
  withSignOut?: boolean;
  avatarSrc?: string;
  words?: number;
  finished?: number;
}) {
  const [open, setOpen] = useState(true);
  const [lang, setLang] = useState<AccountLang>("ES");
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex min-h-[480px] justify-end bg-canvas p-[var(--space-2xl)]">
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Account"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex rounded-pill outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]"
        >
          <Avatar size="md" name="Karina Aguilar" src={avatarSrc} />
        </button>
        <AccountMenu
          open={open}
          onClose={() => setOpen(false)}
          identity={{ name: "Karina Aguilar", avatarSrc, email }}
          stats={{ words, finished }}
          translationLang={lang}
          onTranslationLangChange={setLang}
          onViewProfile={() => console.log("view profile")}
          onSignOut={withSignOut ? () => console.log("sign out") : undefined}
          triggerRef={triggerRef}
        />
      </div>
    </div>
  );
}

/** Signed-in reader — full popover with email + Sign out. */
export const SignedIn: Story = {
  render: () => <Harness email="karina@example.com" />,
};

/** With a loaded avatar image rather than initials. */
export const WithAvatarImage: Story = {
  render: () => (
    <Harness email="karina@example.com" avatarSrc="https://i.pravatar.cc/80?img=47" />
  ),
};

/** Guest — no email line, no Sign out (nothing to sign out of). */
export const Guest: Story = {
  render: () => <Harness withSignOut={false} />,
};

/** Fresh reader — zero counts (matches the Figma default). */
export const EmptyStats: Story = {
  render: () => <Harness email="karina@example.com" words={0} finished={0} />,
};
