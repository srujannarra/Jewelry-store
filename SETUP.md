# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add Your Images and Videos**
   - Place your jewelry images in: `public/images/`
   - Place your jewelry videos in: `public/videos/` (optional)

3. **Update Inventory Data**
   - Open `lib/inventory.ts`
   - Add your inventory items to the `inventoryData` array
   - Update image paths to match your files (e.g., `/images/ring-1.jpg`)

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Adding Inventory Items

Edit `lib/inventory.ts` and add items like this:

```typescript
{
  id: "unique-id-here",
  name: "Your Jewelry Name",
  description: "Detailed description of the item",
  category: "Rings", // or "Necklaces", "Earrings", etc.
  price: 1500,
  weight: 5.2, // in grams (optional)
  material: "Gold",
  karat: 18, // 14, 18, 22, or 24 (optional, for gold items)
  images: ["/images/your-image-1.jpg", "/images/your-image-2.jpg"],
  videos: ["/videos/your-video.mp4"], // optional
  inStock: true,
  sku: "SKU-001",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

## Available Categories

- Rings
- Necklaces
- Earrings
- Bracelets
- Pendants
- Chains
- Bangles
- Anklets
- Brooches
- Watches

## Gold Rate API

The app currently uses `metals.live` API. To use a different source:

1. Edit `lib/goldRate.ts`
2. Replace the API URL with your trusted source
3. Update the data parsing logic if needed

## Code Formatting

- Run `npm run format` to format all code
- Run `npm run lint` to check for errors
- Run `npm run format:check` to verify formatting









