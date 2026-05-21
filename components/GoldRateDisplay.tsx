"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GoldRate } from "@/types/inventory";

export default function GoldRateDisplay() {
  const [goldRate, setGoldRate] = useState<GoldRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<number>(60000); // Default: 60 seconds
  const fetchGoldRateRef = useRef<() => Promise<void>>();

  const fetchGoldRate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gold-rate", {
        cache: "no-store", // Always fetch fresh data
      });
      if (!response.ok) {
        throw new Error("Failed to fetch gold rate");
      }
      const data: GoldRate = await response.json();
      setGoldRate(data);
      setError(null);
      
      // Update refresh interval based on source
      // Metals.live: 60s, MetalpriceAPI: 60s, FreeGoldPrice: 3600s
      let newInterval = 60000; // Default: 60 seconds
      if (data.source.includes("metals.live")) {
        newInterval = 60000; // 60 seconds
      } else if (data.source.includes("MetalpriceAPI")) {
        newInterval = 60000; // 60 seconds
      } else if (data.source.includes("FreeGoldPrice")) {
        newInterval = 3600000; // 1 hour
      }
      
      // Update interval if it changed
      if (refreshIntervalRef.current !== newInterval) {
        refreshIntervalRef.current = newInterval;
        
        // Restart interval with new rate
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
          fetchGoldRateRef.current?.();
        }, newInterval);
      }
    } catch (err) {
      console.error("Error fetching gold rate:", err);
      setError("Unable to fetch gold rate");
      // Retry with shorter interval on error
      const errorInterval = 30000; // 30 seconds on error
      if (refreshIntervalRef.current !== errorInterval) {
        refreshIntervalRef.current = errorInterval;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
          fetchGoldRateRef.current?.();
        }, errorInterval);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep the ref updated with the latest fetch function
  useEffect(() => {
    fetchGoldRateRef.current = fetchGoldRate;
  }, [fetchGoldRate]);

  useEffect(() => {
    // Fetch immediately on mount
    fetchGoldRate();
    
    // Set up automatic refresh (will be updated by fetchGoldRate based on source)
    intervalRef.current = setInterval(() => {
      fetchGoldRateRef.current?.();
    }, refreshIntervalRef.current);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchGoldRate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="animate-pulse">Loading gold rate...</span>
      </div>
    );
  }

  if (error || !goldRate) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400">
        <span>Unable to fetch gold rate</span>
      </div>
    );
  }

  const lastUpdated = new Date(goldRate.lastUpdated);
  const formattedTime = lastUpdated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700 dark:text-gray-300">Gold Rate:</span>
        <span className="text-gold-600 dark:text-gold-400 font-bold">
          ${goldRate.pricePerGram.toFixed(2)}/g
        </span>
        <span className="text-gray-500 dark:text-gray-400">|</span>
        <span className="text-gold-600 dark:text-gold-400 font-bold">
          ${goldRate.pricePerOunce.toFixed(2)}/oz
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span>Updated: {formattedTime}</span>
        <span className="text-xs">({goldRate.source})</span>
      </div>
    </div>
  );
}
