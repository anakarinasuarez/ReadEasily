import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * Browser-side request interception (Service Worker) for dev and Playwright
 * e2e. Started from src/instrumentation-client.ts in development only. Relies
 * on public/mockServiceWorker.js (generated via `npx msw init public/`).
 */
export const worker = setupWorker(...handlers);
