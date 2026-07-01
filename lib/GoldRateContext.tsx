"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { RatesMap } from "@/lib/rates/types";

interface RatesContextValue {
  rates: RatesMap;
  loading: boolean;
  error: string | null;
  /** Force a fresh fetch (used to verify live prices at add-to-cart/checkout). */
  refresh: () => Promise<RatesMap | null>;
}

const RatesContext = createContext<RatesContextValue | undefined>(undefined);

// Client polling cadence. The server caches per element (5 min for live
// metals), so this only refreshes the displayed value — it does not hammer the
// upstream providers.
const POLL_MS = 5 * 60 * 1000;
const ERROR_RETRY_MS = 60 * 1000;

export function RatesProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<RatesMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchRef = useRef<() => Promise<RatesMap | null>>();

  const scheduleNext = useCallback((ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchRef.current?.();
    }, ms);
  }, []);

  const fetchRates = useCallback(async (): Promise<RatesMap | null> => {
    try {
      const response = await fetch("/api/rates", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch rates");
      const data: { rates: RatesMap } = await response.json();
      setRates(data.rates ?? {});
      setError(null);
      scheduleNext(POLL_MS);
      return data.rates ?? {};
    } catch {
      setError("Unable to fetch live metal rates");
      scheduleNext(ERROR_RETRY_MS);
      return null;
    } finally {
      setLoading(false);
    }
  }, [scheduleNext]);

  useEffect(() => {
    fetchRef.current = fetchRates;
  }, [fetchRates]);

  useEffect(() => {
    fetchRates();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchRates]);

  return (
    <RatesContext.Provider value={{ rates, loading, error, refresh: fetchRates }}>
      {children}
    </RatesContext.Provider>
  );
}

/** Backwards-compatible alias used by the root layout. */
export const GoldRateProvider = RatesProvider;

export function useRates(): RatesContextValue {
  const ctx = useContext(RatesContext);
  if (!ctx) {
    throw new Error("useRates must be used within a RatesProvider");
  }
  return ctx;
}
