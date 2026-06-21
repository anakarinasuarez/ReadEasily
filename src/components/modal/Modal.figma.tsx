/**
 * Figma Code Connect mapping for the Modal composite.
 *
 * Mapped to the practice modal (node 881:1428) — the design-lead's reference
 * for this composite. The Modal is a structural shell, so its props map to the
 * dialog's chrome (eyebrow / title / meta / size) while `children` and `footer`
 * are author-composed slots that Code Connect surfaces as free-form children.
 *
 * Consumed by the Figma Code Connect CLI (`@figma/code-connect`), not by the
 * Next.js app build; it is excluded from `tsc`/`eslint` until that toolchain is
 * installed in the repo.
 */
import figma from "@figma/code-connect";
import { Modal } from "./Modal";

figma.connect(
  Modal,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5?node-id=881-1428",
  {
    props: {
      eyebrow: figma.string("Eyebrow"),
      title: figma.string("Title"),
      meta: figma.string("Meta"),
      size: figma.enum("Size", {
        SM: "sm",
        MD: "md",
        LG: "lg",
      }),
      children: figma.children("*"),
    },
    example: ({ eyebrow, title, meta, size, children }) => (
      <Modal
        open
        onOpenChange={() => {}}
        size={size}
        eyebrow={eyebrow}
        title={title}
        meta={meta}
      >
        {children}
      </Modal>
    ),
  },
);
