import { GoldRate } from "@/types/inventory";

// Official gold price sources with their refresh rates
// Sources are tried in order of reliability and refresh frequency

// 1. Metals.live - Updates every 60 seconds (most reliable free API)
const METALS_LIVE_API_URL = "https://api.metals.live/v1/spot/gold";
const METALS_LIVE_REFRESH_RATE = 60; // seconds

// 2. GoldAPI.io - Updates every 5-15 minutes (requires free API key)
const GOLDAPI_BASE_URL = "https://www.goldapi.io/api/XAU/USD";
const GOLDAPI_REFRESH_RATE = 300; // 5 minutes

// 3. MetalpriceAPI - Updates every 1-5 minutes
const METALPRICE_API_URL = "https://api.metalpriceapi.com/v1/latest";
const METALPRICE_REFRESH_RATE = 60; // 1 minute

// 4. FreeGoldPrice.org - Updates hourly
const FREEGOLDPRICE_API_URL = "https://api.freegoldprice.org/v1/gold";
const FREEGOLDPRICE_REFRESH_RATE = 3600; // 1 hour

// Helper function to fetch from metals.live (most reliable, updates every 60s)
async function fetchFromMetalsLive(): Promise<GoldRate | null> {
  try {
    const response = await fetch(METALS_LIVE_API_URL, {
      next: { revalidate: METALS_LIVE_REFRESH_RATE },
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const pricePerOunce = data[0]?.price || 0;
      
      if (pricePerOunce > 0) {
        const pricePerGram = pricePerOunce / 31.1035; // 1 ounce = 31.1035 grams
        
        return {
          pricePerGram: pricePerGram,
          pricePerOunce: pricePerOunce,
          currency: "USD",
          lastUpdated: new Date().toISOString(),
          source: `metals.live (Updates every ${METALS_LIVE_REFRESH_RATE}s)`,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching from metals.live:", error);
  }
  
  return null;
}

// Helper function to fetch from MetalpriceAPI
async function fetchFromMetalpriceAPI(): Promise<GoldRate | null> {
  try {
    // Note: This requires an API key. Set GOLDAPI_KEY environment variable
    const apiKey = process.env.METALPRICE_API_KEY;
    if (!apiKey) {
      return null; // Skip if no API key
    }

    const response = await fetch(`${METALPRICE_API_URL}?api_key=${apiKey}&base=XAU&currencies=USD`, {
      next: { revalidate: METALPRICE_REFRESH_RATE },
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const pricePerOunce = data.rates?.USD || 0;
      
      if (pricePerOunce > 0) {
        const pricePerGram = pricePerOunce / 31.1035;
        
        return {
          pricePerGram: pricePerGram,
          pricePerOunce: pricePerOunce,
          currency: "USD",
          lastUpdated: new Date().toISOString(),
          source: `MetalpriceAPI (Updates every ${METALPRICE_REFRESH_RATE}s)`,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching from MetalpriceAPI:", error);
  }
  
  return null;
}

// Helper function to fetch from FreeGoldPrice.org
async function fetchFromFreeGoldPrice(): Promise<GoldRate | null> {
  try {
    const response = await fetch(FREEGOLDPRICE_API_URL, {
      next: { revalidate: FREEGOLDPRICE_REFRESH_RATE },
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const pricePerOunce = data.price || data.usd || 0;
      
      if (pricePerOunce > 0) {
        const pricePerGram = pricePerOunce / 31.1035;
        
        return {
          pricePerGram: pricePerGram,
          pricePerOunce: pricePerOunce,
          currency: "USD",
          lastUpdated: new Date().toISOString(),
          source: `FreeGoldPrice.org (Updates hourly)`,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching from FreeGoldPrice.org:", error);
  }
  
  return null;
}

// Main function to get gold rate from multiple sources (tries in order)
export async function getGoldRate(): Promise<GoldRate> {
  // Try metals.live first (most reliable, updates every 60s)
  const metalsLiveRate = await fetchFromMetalsLive();
  if (metalsLiveRate) {
    return metalsLiveRate;
  }

  // Try MetalpriceAPI (if API key is configured)
  const metalpriceRate = await fetchFromMetalpriceAPI();
  if (metalpriceRate) {
    return metalpriceRate;
  }

  // Try FreeGoldPrice.org (hourly updates)
  const freeGoldPriceRate = await fetchFromFreeGoldPrice();
  if (freeGoldPriceRate) {
    return freeGoldPriceRate;
  }

  // Fallback: Use a reasonable default value
  // In production, you should cache the last known value from a successful fetch
  console.warn("All gold rate sources failed. Using fallback value.");
  return {
    pricePerGram: 65.5, // Approximate USD per gram
    pricePerOunce: 2035.0, // Approximate USD per ounce
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "fallback (all sources unavailable)",
  };
}

// Get the recommended refresh rate based on the source
export function getRecommendedRefreshRate(source: string): number {
  if (source.includes("metals.live")) {
    return METALS_LIVE_REFRESH_RATE * 1000; // Convert to milliseconds
  }
  if (source.includes("MetalpriceAPI")) {
    return METALPRICE_REFRESH_RATE * 1000;
  }
  if (source.includes("FreeGoldPrice")) {
    return FREEGOLDPRICE_REFRESH_RATE * 1000;
  }
  // Default refresh rate: 60 seconds
  return 60000;
}

// Alternative: You can use this function to fetch from multiple sources
export async function getGoldRateFromMultipleSources(): Promise<GoldRate> {
  // Try primary source first
  const primaryRate = await getGoldRate();
  if (primaryRate.source !== "fallback") {
    return primaryRate;
  }

  // If primary fails, try alternative sources
  // Add your trusted sources here
  return primaryRate;
}









