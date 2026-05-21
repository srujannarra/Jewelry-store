import { InventoryItem, JewelryCategory } from "@/types/inventory";
import { inventoryCache } from "./inventoryCache";

// Use in-memory cache for inventory data
export async function getInventory(
  category?: JewelryCategory
): Promise<InventoryItem[]> {
  return inventoryCache.getAll(category);
}

export async function getInventoryItem(
  id: string
): Promise<InventoryItem | null> {
  return inventoryCache.getById(id);
}

export function getCategories(): JewelryCategory[] {
  return [
    "All",
    "Rings",
    "Necklaces",
    "Earrings",
    "Bracelets",
    "Pendants",
    "Chains",
    "Bangles",
    "Anklets",
    "Brooches",
    "Watches",
  ];
}

// Get category counts from inventory
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const allItems = await getInventory("All");
  const counts: Record<string, number> = {};
  
  allItems.forEach((item) => {
    const category = item.category;
    counts[category] = (counts[category] || 0) + 1;
  });
  
  return counts;
}
