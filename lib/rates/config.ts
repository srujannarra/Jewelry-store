import { ElementConfig, ElementKey } from "./types";
import goldConfig from "@/data/rates/elements/gold.json";
import silverConfig from "@/data/rates/elements/silver.json";
import platinumConfig from "@/data/rates/elements/platinum.json";
import palladiumConfig from "@/data/rates/elements/palladium.json";
import bronzeConfig from "@/data/rates/elements/bronze.json";
import diamondConfig from "@/data/rates/elements/diamond.json";

/**
 * Registry of every priceable element. Each entry is backed by its own JSON
 * file under data/rates/elements/ so a non-technical operator can inspect or
 * tweak a single element in isolation if something looks wrong.
 */
export const ELEMENT_CONFIGS: Record<ElementKey, ElementConfig> = {
  gold: goldConfig as ElementConfig,
  silver: silverConfig as ElementConfig,
  platinum: platinumConfig as ElementConfig,
  palladium: palladiumConfig as ElementConfig,
  bronze: bronzeConfig as ElementConfig,
  diamond: diamondConfig as ElementConfig,
};

export const ELEMENT_KEYS = Object.keys(ELEMENT_CONFIGS) as ElementKey[];

/** Resolve an element key from a free-form material string (e.g. "Gold"). */
export function elementForMaterial(material?: string): ElementKey | null {
  if (!material) return null;
  const needle = material.trim().toLowerCase();
  for (const key of ELEMENT_KEYS) {
    if (ELEMENT_CONFIGS[key].matchesMaterials.includes(needle)) {
      return key;
    }
  }
  return null;
}
