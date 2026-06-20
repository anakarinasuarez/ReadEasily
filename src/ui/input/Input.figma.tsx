// This mapping documents how the Figma Input set (node 16:64) binds to <Input>.
// `@figma/code-connect` is installed in a later phase of the pipeline, so the
// import is suppressed for now to keep the typecheck gate green; it resolves
// once the dependency lands.
// @ts-expect-error -- @figma/code-connect dependency is added in a later phase.
import figma from "@figma/code-connect";
import { Input } from "./Input";
import type { InputProps } from "./Input";

/**
 * Code Connect mapping — Figma "Input" component set (node 16:64).
 *
 * The Figma `State` property is a runtime concept in code, so it is folded into
 * real props: Error → `errorMessage`, Disabled → `disabled`. Default/Focus/Filled
 * are produced at runtime (`:focus-within`, presence of a value) and therefore
 * need no prop mapping.
 */
figma.connect(
  Input,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/?node-id=16-64",
  {
    props: {
      label: figma.string("label"),
      size: figma.enum("Size", { MD: "md", LG: "lg" }),
      disabled: figma.enum("State", { Disabled: true }),
      errorMessage: figma.enum("State", {
        Error: "Please enter a valid email address",
      }),
    },
    example: ({
      label,
      size,
      disabled,
      errorMessage,
    }: Pick<InputProps, "label" | "size" | "disabled" | "errorMessage">) => (
      <Input
        label={label}
        size={size}
        disabled={disabled}
        errorMessage={errorMessage}
        placeholder="you@example.com"
      />
    ),
  },
);
