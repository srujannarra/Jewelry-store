// =============================================================================
// MOCK THIRD-PARTY ERP — daily sales feed
// -----------------------------------------------------------------------------
// In production this module would call the owner's real ERP, e.g.:
//
//   const res = await fetch(`${ERP_CONFIG.baseUrl}/sales/daily?date=${date}`, {
//     headers: { Authorization: `Bearer ${ERP_CONFIG.apiKey}` },
//   });
//   return mapErpResponse(await res.json());
//
// The API key MUST be kept server-side (call this from a Next.js route handler,
// never directly from the browser). Here we simulate the response so the
// dashboard can be tested without the real ERP.
// =============================================================================

export const ERP_CONFIG = {
  provider: "Mock ERP (replace with real ERP)",
  baseUrl: "https://erp.example.com/api/v1", // <-- real ERP base URL goes here
  apiKey: "SET_ON_SERVER", // <-- inject from Secret Manager, never in client
  currency: "INR",
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const PRODUCT_POOL = [
  "Classic 18K Gold Wedding Ring",
  "Sterling Silver Rope Necklace",
  "Platinum Link Chain",
  "Solitaire Diamond Pendant",
  "Antique Bronze Brooch",
  "22K Gold Bangle",
  "Diamond Stud Earrings",
];
const CHANNELS = ["In-store", "Website", "Phone order", "WhatsApp"];

/**
 * Fetch today's sales from the (simulated) ERP.
 * @param {{simulateFailure?:boolean, date?:string}} opts
 */
export async function fetchDailySales({ simulateFailure = false, date } = {}) {
  await delay(500 + Math.random() * 400); // simulate network latency
  if (simulateFailure) {
    throw new Error("ERP unreachable (simulated). The dashboard must degrade gracefully.");
  }

  const day = date || new Date().toISOString().slice(0, 10);
  const seed = [...day].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);

  const orderCount = 8 + Math.floor(rand() * 22);
  const recent = [];
  let totalRevenue = 0;
  let unitsSold = 0;

  for (let i = 0; i < orderCount; i++) {
    const qty = 1 + Math.floor(rand() * 3);
    const amount = Math.round((4000 + rand() * 90000) * qty);
    const hour = Math.floor(rand() * 13) + 9; // 9am–9pm
    const minute = Math.floor(rand() * 60);
    totalRevenue += amount;
    unitsSold += qty;
    recent.push({
      invoice: `INV-${day.replace(/-/g, "")}-${(i + 1).toString().padStart(3, "0")}`,
      time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      item: PRODUCT_POOL[Math.floor(rand() * PRODUCT_POOL.length)],
      qty,
      amount,
      channel: CHANNELS[Math.floor(rand() * CHANNELS.length)],
    });
  }
  recent.sort((a, b) => (a.time < b.time ? 1 : -1));

  // hourly revenue buckets (9..21)
  const hourly = Array.from({ length: 13 }, (_, idx) => {
    const h = idx + 9;
    const rev = recent
      .filter((r) => Number(r.time.slice(0, 2)) === h)
      .reduce((a, r) => a + r.amount, 0);
    return { hour: h, revenue: rev };
  });

  // top products by revenue
  const byProduct = {};
  recent.forEach((r) => {
    byProduct[r.item] = (byProduct[r.item] || 0) + r.amount;
  });
  const topProducts = Object.entries(byProduct)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    source: ERP_CONFIG.provider,
    fetchedAt: new Date().toISOString(),
    date: day,
    currency: ERP_CONFIG.currency,
    totalRevenue,
    orderCount,
    unitsSold,
    avgOrderValue: Math.round(totalRevenue / orderCount),
    hourly,
    topProducts,
    recent: recent.slice(0, 12),
  };
}
