import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../../tests/mocks/server";
import { renderWithQuery } from "../../../tests/utils/query";
import { GreetingDemo } from "./GreetingDemo";

/**
 * Integration proof: TanStack Query fetches, MSW answers, the component shows
 * the result. This guards the whole data plumbing — if Query, the provider
 * wrapper, or the MSW node server breaks, this test goes red.
 */
describe("Query + MSW data path", () => {
  it("renders the message returned by the mocked endpoint", async () => {
    renderWithQuery(<GreetingDemo />);

    // Asserting the server-supplied text (not a hardcoded string in the
    // component) is what makes this prove the fetch actually happened.
    expect(await screen.findByText("Hello from MSW")).toBeInTheDocument();
  });

  it("surfaces an error state when the endpoint fails", async () => {
    // Per-test override; afterEach resetHandlers() restores the default.
    server.use(
      http.get("/api/demo/greeting", () =>
        HttpResponse.json({ message: "boom" }, { status: 500 }),
      ),
    );

    renderWithQuery(<GreetingDemo />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Could not load greeting.",
      ),
    );
  });
});
