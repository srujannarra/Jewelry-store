# Image Setup Guide

## Current Status

✅ **The app is currently using Unsplash jewelry images as placeholders**
- All items display actual jewelry photos from Unsplash
- Images are automatically loaded based on category
- No setup required - images work immediately!

## Adding Your Own Images

When you're ready to add your own jewelry images, follow these steps:

### 1. Create Category Folders

Create folders in `public/images/` for each category:

```
public/images/
├── rings/
├── necklaces/
├── earrings/
├── bracelets/
├── pendants/
├── chains/
├── bangles/
├── anklets/
├── brooches/
└── watches/
```

### 2. Name Your Images

Images must be named exactly as shown below (based on item names in the inventory):

**Rings:**
- `classic-18k-gold-wedding-ring.jpg`
- `diamond-solitaire-engagement-ring.jpg`
- `diamond-solitaire-engagement-ring-1.jpg` (for second image)
- `vintage-art-deco-ring.jpg`
- `platinum-eternity-band.jpg`
- `rose-gold-stackable-ring-set.jpg`

**Necklaces:**
- `pearl-strand-necklace.jpg`
- `diamond-pendant-necklace.jpg`
- `diamond-pendant-necklace-1.jpg` (for second image)
- `gold-choker-with-gemstones.jpg`
- `layered-gold-chain-set.jpg`
- `vintage-locket-necklace.jpg`

**Earrings:**
- `diamond-stud-earrings.jpg`
- `pearl-drop-earrings.jpg`
- `hoop-earrings-22k-gold.jpg`
- `chandelier-earrings-with-crystals.jpg`
- `minimalist-gold-huggies.jpg`

**Bracelets:**
- `tennis-bracelet-diamond.jpg`
- `gold-bangle-set.jpg`
- `charm-bracelet-18k-gold.jpg`
- `cuff-bracelet-with-gemstones.jpg`
- `link-chain-bracelet.jpg`

**Pendants:**
- `heart-pendant-18k-gold.jpg`
- `cross-pendant-diamond.jpg`
- `initial-pendant-custom.jpg`
- `tree-of-life-pendant.jpg`

**Chains:**
- `cuban-link-chain-22k.jpg`
- `rope-chain-18k-gold.jpg`
- `box-chain-14k-gold.jpg`
- `figaro-chain-22k-gold.jpg`

**Bangles:**
- `traditional-gold-bangle.jpg`
- `diamond-bangle-set.jpg`
- `hinged-bangle-18k.jpg`
- `open-cuff-bangle.jpg`

**Anklets:**
- `delicate-gold-anklet.jpg`
- `chain-anklet-with-pendant.jpg`
- `beaded-anklet.jpg`

**Brooches:**
- `vintage-floral-brooch.jpg`
- `art-deco-brooch.jpg`
- `butterfly-brooch-diamond.jpg`

**Watches:**
- `luxury-gold-watch.jpg`
- `diamond-watch-22k.jpg`
- `vintage-gold-watch.jpg`
- `sport-gold-watch.jpg`

### 3. Naming Rules

- Convert item name to lowercase
- Replace spaces with hyphens (`-`)
- Remove special characters (keep only letters, numbers, hyphens)
- Use `.jpg` extension (or `.png`, `.webp`)
- For multiple images of same item, add `-1`, `-2`, etc.

### 4. How It Works

1. **Current**: App uses Unsplash jewelry images (works immediately)
2. **When you add images**: The app automatically detects local images and uses them instead
3. **Fallback**: If a local image doesn't exist, it falls back to Unsplash

### 5. Testing

After adding your images:
1. Place them in the correct category folder
2. Name them exactly as shown above
3. Refresh your browser
4. Your images will appear automatically!

## Video Setup

Videos work similarly. Place them in `public/videos/` with the same naming convention:

```
public/videos/
├── necklaces/
│   └── diamond-pendant-necklace-showcase.mp4
├── earrings/
│   └── chandelier-earrings-showcase.mp4
└── watches/
    └── diamond-watch-showcase.mp4
```

## Troubleshooting

**Images not showing?**
- Check the browser console for errors
- Verify image names match exactly (case-sensitive)
- Ensure images are in the correct category folder
- Check file extensions (.jpg, .png, .webp)

**Want to use different image names?**
- Edit `lib/inventoryCache.ts`
- Update the `img()` function calls to match your file names









