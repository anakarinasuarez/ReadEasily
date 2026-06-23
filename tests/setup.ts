import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { server } from "./mocks/server";
import { resetSavedWords } from "./mocks/handlers";

// jest-axe's matcher works under Vitest once registered with its expect.
expect.extend(toHaveNoViolations);

// MSW intercepts network for the whole unit run so tests never touch the real
// network. `error` surfaces any unmocked request as a failure instead of a
// silent leak — add a handler rather than loosening this.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Unmount React trees and drop any per-test handler overrides between cases.
afterEach(() => {
  cleanup();
  server.resetHandlers();
  // Restore the mutable saved-words list so a DELETE in one test never leaks.
  resetSavedWords();
});

afterAll(() => server.close());
