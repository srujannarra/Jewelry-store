import { NextResponse } from "next/server";
import { getAllElementRates } from "@/lib/rates/service";

export async function GET() {
  try {
    const rates = await getAllElementRates();
    const anyStale = Object.values(rates).some((r) => r?.isStale);
    return NextResponse.json(
      { rates, updatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Rates-Stale": anyStale ? "true" : "false",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching element rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch rates" },
      { status: 500 },
    );
  }
}

// Matches the per-element cache TTL (5 minutes for live metals).
export const revalidate = 300;
