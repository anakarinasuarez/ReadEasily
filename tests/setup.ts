import "@testing-library/jest-dom/vitest";
import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";

// jest-axe's matcher works under Vitest once registered with its expect.
expect.extend(toHaveNoViolations);

// Unmount React trees between tests so queries don't leak across cases.
afterEach(() => {
  cleanup();
});
