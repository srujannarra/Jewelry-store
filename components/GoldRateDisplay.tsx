"use client";

import { useRates } from "@/lib/GoldRateContext";
import { formatINR, TROY_OUNCE_IN_GRAMS } from "@/lib/pricing";

export default function GoldRateDisplay() {
  const { rates, loading, error } = useRates();
  const gold = rates.gold;

  if (loading && !gold) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="animate-pulse">Loading gold rate...</span>
      </div>
    );
  }

  if (error && !gold) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-300">
        <span>Live gold rate temporarily unavailable — prices use last known values</span>
      </div>
    );
  }

  if (!gold) return null;

  const lastUpdated = new Date(gold.lastUpdated);
  const formattedTime = lastUpdated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          Gold (24K):
        </span>
        <span className="text-gold-600 dark:text-gold-400 font-bold">
          {formatINR(gold.pricePerUnit)}/g
        </span>
        <span className="text-gray-500 dark:text-gray-400">|</span>
        <span className="text-gold-600 dark:text-gold-400 font-bold">
          {formatINR(gold.pricePerUnit * TROY_OUNCE_IN_GRAMS)}/oz
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span>Updated: {formattedTime}</span>
        {gold.isStale && (
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
            cached
          </span>
        )}
      </div>
    </div>
  );
}
