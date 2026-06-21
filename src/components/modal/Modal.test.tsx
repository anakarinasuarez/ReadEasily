import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Modal, type ModalProps } from "./Modal";
import { Button } from "../../ui/button";

/** Controlled harness — the Modal owns nothing, so the test drives `open`. */
function Harness({
  onOpenChange,
  ...props
}: Partial<ModalProps> & { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
      title="Path"
      eyebrow="Practice · 10 sentences"
      meta="sendero, camino"
      footer={<Button onClick={() => setOpen(false)}>Done</Button>}
      {...props}
    >
      <p>The path through the forest is beautiful.</p>
    </Modal>
  );
}

describe("Modal", () => {
  it("renders the dialog with its content when open", () => {
    render(<Harness />);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Path")).toBeInTheDocument();
    expect(
      within(dialog).getByText("The path through the forest is beautiful."),
    ).toBeInTheDocument();
  });

  it("is not in the document when closed", () => {
    function ClosedHarness() {
      return (
        <Modal open={false} onOpenChange={() => {}} title="Path">
          <p>hidden body</p>
        </Modal>
      );
    }
    render(<ClosedHarness />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("labels the dialog with its title (aria-labelledby → Dialog.Title)", () => {
    render(<Harness />);
    // The accessible name comes from the wired Radix Title.
    expect(screen.getByRole("dialog", { name: "Path" })).toBeInTheDocument();
  });

  it("describes the dialog with its meta (aria-describedby → Dialog.Description)", () => {
    render(<Harness />);
    const dialog = screen.getByRole("dialog");
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const description = document.getElementById(describedBy!);
    expect(description).toHaveTextContent("sendero, camino");
  });

  it("does not leave a dangling aria-describedby when there is no meta", () => {
    render(
      <Modal open onOpenChange={() => {}} title="Path">
        <p>body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toHaveAttribute("aria-describedby");
  });

  it("moves focus into the dialog on open", async () => {
    render(<Harness />);
    const dialog = screen.getByRole("dialog");
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("exposes a labelled close button that closes the dialog", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    const close = screen.getByRole("button", { name: "Close" });
    await user.click(close);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not close on Escape or render a close button when not dismissible", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness dismissible={false} onOpenChange={onOpenChange} />);

    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has no axe violations when open", async () => {
    const { baseElement } = render(<Harness />);
    // Radix portals the dialog to document.body — scan the whole tree.
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });
});
