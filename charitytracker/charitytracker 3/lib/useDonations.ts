"use client";
import { useCallback, useEffect, useState } from "react";
import { DonationsPayload } from "./types";

const EMPTY: DonationsPayload = { donations: [], totals: {}, grandTotal: 0 };

// Polls the donations API on an interval. Polling (rather than a live socket)
// is what works on Vercel's serverless setup, and a couple of seconds is fast
// enough to feel live on the donation, presenter, and developer views.
export function useDonations(intervalMs = 2500) {
  const [data, setData] = useState<DonationsPayload>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/donations", { cache: "no-store" });
      const d = (await res.json()) as DonationsPayload;
      setData(d);
      setLoaded(true);
    } catch {
      // Ignore a transient failure; the next poll will retry.
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, intervalMs);
    return () => clearInterval(t);
  }, [refresh, intervalMs]);

  return { data, loaded, refresh };
}
