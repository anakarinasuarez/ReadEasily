"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Reference component proving the TanStack Query + MSW data path end to end.
 * It is the pattern feature-builders should copy: a typed fetcher, a `useQuery`
 * with a stable key, and explicit loading / error / success rendering. Real
 * features replace this; the colocated test must keep passing meanwhile.
 */
type Greeting = { message: string };

async function fetchGreeting(): Promise<Greeting> {
  const res = await fetch("/api/demo/greeting");
  if (!res.ok) throw new Error("Failed to load greeting");
  return res.json();
}

export function GreetingDemo() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["demo", "greeting"],
    queryFn: fetchGreeting,
  });

  if (isPending) return <p role="status">Loading…</p>;
  if (isError) return <p role="alert">Could not load greeting.</p>;

  return <p>{data.message}</p>;
}
