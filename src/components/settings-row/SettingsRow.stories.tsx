import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  SettingsRow,
  type SettingsRowToggleProps,
  type SettingsRowNavProps,
  type SettingsRowBadgeProps,
  type SettingsRowCustomProps,
} from "./SettingsRow";

/**
 * SettingsRow stories cover all 4 control variants (toggle/nav/badge/custom),
 * each with/without the leading icon + description, the disabled + loading
 * states, the 5 Figma tile tones, and rows grouped into a card — which is how
 * the Profile → Settings screen (149:286) actually composes them.
 *
 * Because the props are a discriminated union, each story is typed against its
 * own variant subtype (a single `StoryObj<typeof meta>` would collapse the
 * union's `args` to `never`).
 */
const meta = {
  title: "Components/SettingsRow",
  component: SettingsRow,
  parameters: { layout: "padded" },
  // Render every row inside a fixed-width elevated card so the layout reads
  // the way it does on the Settings screen.
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-lg bg-surface-elevated shadow-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsRow>;

export default meta;

type ToggleStory = StoryObj<SettingsRowToggleProps>;
type NavStory = StoryObj<SettingsRowNavProps>;
type BadgeStory = StoryObj<SettingsRowBadgeProps>;
type CustomStory = StoryObj<SettingsRowCustomProps>;

/* --- demo glyphs (Figma per-type icons; decorative in stories) ------------ */
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const VolumeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
  </svg>
);
const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
  </svg>
);

/* --- toggle --------------------------------------------------------------- */
export const Toggle: ToggleStory = {
  args: {
    variant: "toggle",
    iconTone: "success",
    icon: <PlayIcon />,
    label: "Autoplay narration",
    description: "Play each story automatically",
    checked: true,
    onCheckedChange: () => {},
  },
  render: function ToggleStoryRender(args) {
    const [checked, setChecked] = useState(true);
    return <SettingsRow {...args} checked={checked} onCheckedChange={setChecked} />;
  },
};

export const ToggleNoIconNoDescription: ToggleStory = {
  args: {
    variant: "toggle",
    label: "Reduce motion",
    checked: false,
    onCheckedChange: () => {},
  },
  render: function MinimalToggle(args) {
    const [checked, setChecked] = useState(false);
    return <SettingsRow {...args} checked={checked} onCheckedChange={setChecked} />;
  },
};

export const ToggleDisabled: ToggleStory = {
  args: {
    variant: "toggle",
    iconTone: "warning",
    icon: <VolumeIcon />,
    label: "Pronounce words",
    description: "Read each tapped word aloud",
    checked: true,
    disabled: true,
    onCheckedChange: () => {},
  },
};

export const ToggleLoading: ToggleStory = {
  args: {
    variant: "toggle",
    iconTone: "success",
    icon: <PlayIcon />,
    label: "Autoplay narration",
    description: "Saving your preference…",
    checked: true,
    loading: true,
    onCheckedChange: () => {},
  },
};

/* --- nav ------------------------------------------------------------------ */
export const Nav: NavStory = {
  args: {
    variant: "nav",
    iconTone: "info",
    icon: <GlobeIcon />,
    label: "Translation language",
    description: "Word meanings while you read",
    value: "Español",
    onClick: () => {},
  },
};

export const NavNoDescription: NavStory = {
  args: {
    variant: "nav",
    label: "Account",
    value: "cristian@…",
    onClick: () => {},
  },
};

export const NavDisabled: NavStory = {
  args: {
    variant: "nav",
    iconTone: "info",
    icon: <GlobeIcon />,
    label: "Reading accent",
    description: "Coming soon",
    value: "US",
    disabled: true,
    onClick: () => {},
  },
};

/* --- badge ---------------------------------------------------------------- */
export const BadgeStatus: BadgeStory = {
  args: {
    variant: "badge",
    iconTone: "accent",
    icon: <BoltIcon />,
    label: "Subscription",
    description: "Your current plan",
    badge: { tone: "success", children: "Active" },
  },
};

/* --- custom (segmented control lives here until a primitive exists) ------- */
export const Custom: CustomStory = {
  args: {
    variant: "custom",
    iconTone: "info",
    icon: <GlobeIcon />,
    label: "Translation language",
    description: "Word meanings while you read",
    control: (
      // Demo-only inline segmented control. A real `Segmented` primitive is
      // flagged as missing — see the component header / report.
      <div className="flex items-center gap-xs" role="group" aria-label="Language">
        <span className="rounded-pill bg-info px-md py-[7px] text-label-m font-display font-bold text-on-accent">
          ES
        </span>
        <span className="rounded-pill px-md py-[7px] text-label-m font-display font-bold text-secondary">
          FR
        </span>
        <span className="rounded-pill px-md py-[7px] text-label-m font-display font-bold text-secondary">
          PT
        </span>
      </div>
    ),
  },
};

/* --- the 6 tile tones ----------------------------------------------------- */
export const IconTones: BadgeStory = {
  args: { variant: "badge", label: "Tone", badge: { children: "Badge" } },
  render: () => (
    <>
      <SettingsRow variant="badge" divider icon={<BoltIcon />} iconTone="accent" label="Accent tile" badge={{ tone: "accent", children: "accent" }} />
      <SettingsRow variant="badge" divider icon={<GlobeIcon />} iconTone="info" label="Info tile" badge={{ tone: "info", children: "info" }} />
      <SettingsRow variant="badge" divider icon={<PlayIcon />} iconTone="success" label="Success tile" badge={{ tone: "success", children: "success" }} />
      <SettingsRow variant="badge" divider icon={<VolumeIcon />} iconTone="warning" label="Warning tile" badge={{ tone: "warning", children: "warning" }} />
      <SettingsRow variant="badge" divider icon={<BoltIcon />} iconTone="plum" label="Plum tile" badge={{ tone: "info", children: "plum" }} />
      <SettingsRow variant="badge" icon={<BoltIcon />} iconTone="danger" label="Danger tile" badge={{ tone: "danger", children: "danger" }} />
    </>
  ),
};

/* --- destructive nav row (danger title + tile, Delete account) ------------ */
export const DangerNav: NavStory = {
  args: {
    variant: "nav",
    iconTone: "danger",
    titleTone: "danger",
    icon: <BoltIcon />,
    label: "Delete account",
    description: "Remove your profile and all data",
    onClick: () => {},
  },
};

/* --- grouped in a card (the real Settings list) --------------------------- */
export const GroupedInCard: ToggleStory = {
  args: { variant: "toggle", label: "Group", checked: false, onCheckedChange: () => {} },
  render: function Group() {
    const [autoplay, setAutoplay] = useState(true);
    const [pronounce, setPronounce] = useState(true);
    const [motion, setMotion] = useState(false);
    return (
      <>
        <SettingsRow
          variant="nav"
          divider
          icon={<GlobeIcon />}
          iconTone="info"
          label="Translation language"
          description="Word meanings while you read"
          value="Español"
          onClick={() => {}}
        />
        <SettingsRow
          variant="toggle"
          divider
          icon={<PlayIcon />}
          iconTone="success"
          label="Autoplay narration"
          description="Play each story automatically"
          checked={autoplay}
          onCheckedChange={setAutoplay}
        />
        <SettingsRow
          variant="toggle"
          divider
          icon={<VolumeIcon />}
          iconTone="warning"
          label="Pronounce words"
          description="Read each tapped word aloud"
          checked={pronounce}
          onCheckedChange={setPronounce}
        />
        <SettingsRow
          variant="toggle"
          icon={<BoltIcon />}
          iconTone="accent"
          label="Reduce motion"
          description="Calm transitions"
          checked={motion}
          onCheckedChange={setMotion}
        />
      </>
    );
  },
};
