import "vitest";

// jest-axe ships matcher types for jest's expect only. Re-declare the matcher
// on Vitest's Assertion interface so `expect(results).toHaveNoViolations()`
// type-checks under our globals setup.
declare module "vitest" {
  interface Assertion {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
