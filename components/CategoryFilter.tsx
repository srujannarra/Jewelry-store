"use client";

import { useState } from "react";
import { JewelryCategory } from "@/types/inventory";
import { getCategories } from "@/lib/inventory";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = (searchParams.get("category") as JewelryCategory) || "All";
  const categories = getCategories();

  const handleCategoryChange = (category: JewelryCategory) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    // Use current pathname to maintain the page context (home or inventory)
    const basePath = pathname === "/inventory" ? "/inventory" : "/";
    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Categories</h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              currentCategory === category
                ? "bg-gold-600 dark:bg-gold-500 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gold-900/30 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

