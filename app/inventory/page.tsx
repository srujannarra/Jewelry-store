import { Suspense } from "react";
import InventoryGrid from "@/components/InventoryGrid";
import CategoryFilter from "@/components/CategoryFilter";
import { getInventory } from "@/lib/inventory";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = (params.category as any) || "All";
  const inventory = await getInventory(category);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Our Inventory
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Explore our complete collection of fine jewelry
        </p>
      </div>

      <Suspense fallback={<div className="mb-8 text-gray-600 dark:text-gray-400">Loading categories...</div>}>
        <CategoryFilter />
      </Suspense>
      
      <InventoryGrid inventory={inventory} />
    </div>
  );
}

