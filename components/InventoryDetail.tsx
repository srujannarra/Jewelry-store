"use client";

import { InventoryItem } from "@/types/inventory";
import JewelryImage from "./JewelryImage";
import { useState } from "react";

interface InventoryDetailProps {
  item: InventoryItem;
}

export default function InventoryDetail({ item }: InventoryDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const mainImage = item.images[selectedImageIndex] || "";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="relative h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
            {item.images.length > 0 ? (
              <JewelryImage
                src={mainImage}
                alt={item.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <svg
                  className="w-32 h-32"
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
          </div>
          {item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-20 w-full rounded overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? "border-gold-600 dark:border-gold-400"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <JewelryImage
                    src={image}
                    alt={`${item.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                </button>
              ))}
            </div>
          )}
          {item.videos && item.videos.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Videos</h3>
              <div className="space-y-2">
                {item.videos.map((video, index) => (
                  <div key={index} className="relative">
                    <video
                      src={video}
                      controls
                      className="w-full rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = "none";
                        const errorDiv = document.createElement("div");
                        errorDiv.className = "bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400";
                        errorDiv.textContent = "Video not available";
                        target.parentElement?.appendChild(errorDiv);
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{item.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl font-bold text-gold-600 dark:text-gold-400">
              ${item.price.toLocaleString()}
            </span>
            {item.karat && (
              <span className="text-xl text-gray-600 dark:text-gray-400">{item.karat}k Gold</span>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Category: </span>
              <span className="text-gray-600 dark:text-gray-400">{item.category}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Material: </span>
              <span className="text-gray-600 dark:text-gray-400">{item.material}</span>
            </div>
            {item.weight && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Weight: </span>
                <span className="text-gray-600 dark:text-gray-400">{item.weight} grams</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">SKU: </span>
              <span className="text-gray-600 dark:text-gray-400">{item.sku}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Availability: </span>
              <span
                className={`font-semibold ${
                  item.inStock ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
              >
                {item.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
          </div>

          <button
            disabled={!item.inStock}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
              item.inStock
                ? "bg-gold-600 dark:bg-gold-500 text-white hover:bg-gold-700 dark:hover:bg-gold-600"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            {item.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

