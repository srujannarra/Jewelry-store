import { NextResponse } from "next/server";
import { getGoldRate } from "@/lib/goldRate";

// HTTP header values must be ISO-8859-1; strip anything outside that range
// (e.g. em dashes used in human-readable source labels).
function headerSafe(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "-").trim();
}

export async function GET() {
  try {
    // Fetch fresh gold rate from official sources
    const goldRate = await getGoldRate();
    
    // Set cache headers for optimal refresh
    // Allow caching but revalidate frequently
    return NextResponse.json(goldRate, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Gold-Rate-Source': headerSafe(goldRate.source),
        'X-Last-Updated': headerSafe(goldRate.lastUpdated),
        'X-Gold-Rate-Stale': goldRate.isStale ? 'true' : 'false',
      },
    });
  } catch (error) {
    console.error("Error fetching gold rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch gold rate" },
      { status: 500 }
    );
  }
}

// Revalidate every 5 minutes (matches the server-side cache TTL)
export const revalidate = 300;









