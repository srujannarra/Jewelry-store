import { JewelryCategory } from "@/types/inventory";

export interface CategoryMeta {
  slug: JewelryCategory;
  label: string;
  image: string;
  /** Soft pastel backdrop behind product photography */
  surface: string;
}

/** Display order for home “Shop by category” (excludes “All”). */
export const SHOP_CATEGORIES: CategoryMeta[] = [
  {
    slug: "Necklaces",
    label: "Necklaces",
    image: "/images/necklaces/diamond-pendant-necklace.jpg",
    surface: "from-rose-100 via-rose-50 to-pink-100",
  },
  {
    slug: "Pendants",
    label: "Pendants",
    image: "/images/pendants/heart-pendant-18k-gold.jpg",
    surface: "from-sky-100 via-blue-50 to-slate-100",
  },
  {
    slug: "Rings",
    label: "Rings",
    image: "/images/rings/diamond-solitaire-engagement-ring.jpg",
    surface: "from-stone-200 via-amber-50 to-stone-100",
  },
  {
    slug: "Earrings",
    label: "Earrings",
    image: "/images/earrings/diamond-stud-earrings.jpg",
    surface: "from-neutral-200 via-stone-100 to-amber-50",
  },
  {
    slug: "Bangles",
    label: "Bangles",
    image: "/images/bangles/traditional-gold-bangle.jpg",
    surface: "from-violet-100 via-purple-50 to-fuchsia-100",
  },
  {
    slug: "Bracelets",
    label: "Bracelets",
    image: "/images/bracelets/tennis-bracelet-diamond.jpg",
    surface: "from-rose-50 via-pink-50 to-rose-100",
  },
  {
    slug: "Chains",
    label: "Chains",
    image: "/images/chains/rope-chain-18k-gold.jpg",
    surface: "from-amber-100 via-yellow-50 to-orange-50",
  },
  {
    slug: "Anklets",
    label: "Anklets",
    image: "/images/anklets/delicate-gold-anklet.jpg",
    surface: "from-pink-100 via-rose-50 to-red-50",
  },
  {
    slug: "Brooches",
    label: "Brooches",
    image: "/images/brooches/butterfly-brooch-diamond.jpg",
    surface: "from-indigo-50 via-violet-50 to-purple-100",
  },
  {
    slug: "Watches",
    label: "Watches",
    image: "/images/watches/luxury-gold-watch.jpg",
    surface: "from-slate-100 via-gray-50 to-zinc-100",
  },
];

export function categoryInventoryHref(category: JewelryCategory): string {
  return `/inventory?category=${encodeURIComponent(category)}`;
}
