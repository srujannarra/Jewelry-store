"use client";

import { InventoryItem } from "@/types/inventory";
import JewelryImage from "./JewelryImage";
import Link from "next/link";

interface InventoryCardProps {
  item: InventoryItem;
}

export default function InventoryCard({ item }: InventoryCardProps) {
  const mainImage = item.images[0] || "";

  return (
    <Link href={`/inventory/${item.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-800 transition-shadow duration-300 cursor-pointer group">
        <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-700">
          {item.images.length > 0 ? (
            <JewelryImage
              src={mainImage}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {!item.inStock && (
            <div className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Out of Stock
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gold-600 dark:text-gold-400">
              ${item.price.toLocaleString()}
            </span>
            {item.karat && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{item.karat}k</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs bg-gold-100 dark:bg-gold-900 text-gold-800 dark:text-gold-200 px-2 py-1 rounded">
              {item.category}
            </span>
            {item.material && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                {item.material}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

