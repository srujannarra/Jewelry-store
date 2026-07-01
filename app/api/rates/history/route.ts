import { NextRequest, NextResponse } from "next/server";
import { readHistory } from "@/lib/rates/store";
import { ELEMENT_CONFIGS, ELEMENT_KEYS } from "@/lib/rates/config";
import { ElementKey, RateHistoryEntry } from "@/lib/rates/types";

/**
 * Returns the stored rate history for one element plus a simple volatility
 * summary, intended for future market-volatility analysis dashboards.
 *
 *   GET /api/rates/history?element=gold&limit=200
 */
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function summarize(history: RateHistoryEntry[]) {
  const prices = history.map((h) => h.pricePerUnit);
  if (prices.length === 0) {
    return { samples: 0 };
  }
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const sd = stdDev(prices);
  return {
    samples: prices.length,
    first: prices[0],
    last: prices[prices.length - 1],
    min: Math.min(...prices),
    max: Math.max(...prices),
    mean: Math.round(mean),
    stdDev: Math.round(sd),
    // Coefficient of variation as a % — a quick volatility proxy.
    volatilityPct: mean > 0 ? Number(((sd / mean) * 100).toFixed(2)) : 0,
  };
}

export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("element") as ElementKey | null;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 500);

  if (!param || !ELEMENT_KEYS.includes(param)) {
    return NextResponse.json(
      { error: `Unknown element. Use one of: ${ELEMENT_KEYS.join(", ")}` },
      { status: 400 },
    );
  }

  const history = readHistory(param, Number.isFinite(limit) ? limit : 500);
  return NextResponse.json({
    element: param,
    label: ELEMENT_CONFIGS[param].label,
    unit: ELEMENT_CONFIGS[param].unit,
    summary: summarize(history),
    history,
  });
}
