import { NextResponse } from "next/server";
import { getGoldRate } from "@/lib/goldRate";

export async function GET() {
  try {
    // Fetch fresh gold rate from official sources
    const goldRate = await getGoldRate();
    
    // Set cache headers for optimal refresh
    // Allow caching but revalidate frequently
    return NextResponse.json(goldRate, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Gold-Rate-Source': goldRate.source,
        'X-Last-Updated': goldRate.lastUpdated,
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

// Revalidate every 60 seconds (for ISR)
export const revalidate = 60;









