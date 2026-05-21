import { getInventoryItem } from "@/lib/inventory";
import { notFound } from "next/navigation";
import InventoryDetail from "@/components/InventoryDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InventoryItemPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getInventoryItem(id);

  if (!item) {
    notFound();
  }

  return <InventoryDetail item={item} />;
}








