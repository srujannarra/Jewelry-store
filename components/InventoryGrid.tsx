import { InventoryItem } from "@/types/inventory";
import InventoryCard from "./InventoryCard";

interface InventoryGridProps {
  inventory: InventoryItem[];
}

export default function InventoryGrid({ inventory }: InventoryGridProps) {
  if (inventory.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No items found in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {inventory.map((item) => (
        <InventoryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
