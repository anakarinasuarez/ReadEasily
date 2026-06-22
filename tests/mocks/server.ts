import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * Node-side request interception for the unit/integration test run (Vitest).
 * Started/stopped from tests/setup.ts. Individual tests can override responses
 * per-case with `server.use(...)` — resetHandlers() in afterEach clears them.
 */
export const server = setupServer(...handlers);
