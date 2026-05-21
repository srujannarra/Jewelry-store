# Images Directory

Place your jewelry images here organized by category.

## Directory Structure

```
public/images/
├── rings/
│   ├── classic-18k-gold-wedding-ring.jpg
│   ├── diamond-solitaire-engagement-ring.jpg
│   └── ...
├── necklaces/
│   ├── pearl-strand-necklace.jpg
│   └── ...
├── earrings/
├── bracelets/
├── pendants/
├── chains/
├── bangles/
├── anklets/
├── brooches/
└── watches/
```

## Image Naming Convention

Images should be named based on the item name:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Add `.jpg` extension

Example:
- Item: "Classic 18K Gold Wedding Ring"
- Filename: `classic-18k-gold-wedding-ring.jpg`
- Path: `public/images/rings/classic-18k-gold-wedding-ring.jpg`

## Current Behavior

1. The app first tries to load images from this directory
2. If an image doesn't exist, it automatically uses Unsplash jewelry images as placeholders
3. When you add your images with the correct names, they will automatically display

## Adding Your Images

1. Create category folders if they don't exist
2. Name your images according to the item names in `lib/inventoryCache.ts`
3. Place them in the appropriate category folder
4. Refresh the browser - your images will appear automatically!









