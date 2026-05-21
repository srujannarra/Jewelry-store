# Sample Data Overview

The application now includes comprehensive sample data stored in an in-memory cache. All data is automatically loaded when the application starts.

## Inventory Statistics

- **Total Items**: 50+ jewelry pieces
- **Categories Covered**: All 10 categories
- **Price Range**: $380 - $18,500
- **Materials**: Gold (14K, 18K, 22K), Platinum, Silver

## Sample Data by Category

### Rings (5 items)
- Classic 18K Gold Wedding Ring - $1,850
- Diamond Solitaire Engagement Ring - $8,500
- Vintage Art Deco Ring - $3,200
- Platinum Eternity Band - $4,200
- Rose Gold Stackable Ring Set - $950

### Necklaces (5 items)
- Pearl Strand Necklace - $2,800
- Diamond Pendant Necklace - $12,500 (with video)
- Gold Choker with Gemstones - $6,800
- Layered Gold Chain Set - $2,400
- Vintage Locket Necklace - $1,650 (Out of Stock)

### Earrings (5 items)
- Diamond Stud Earrings - $3,500
- Pearl Drop Earrings - $1,200
- Hoop Earrings 22K Gold - $2,200
- Chandelier Earrings with Crystals - $2,800 (with video)
- Minimalist Gold Huggies - $450

### Bracelets (5 items)
- Tennis Bracelet Diamond - $8,500
- Gold Bangle Set - $3,200
- Charm Bracelet 18K Gold - $1,800
- Cuff Bracelet with Gemstones - $5,200
- Link Chain Bracelet - $950

### Pendants (4 items)
- Heart Pendant 18K Gold - $1,250
- Cross Pendant Diamond - $2,800
- Initial Pendant Custom - $650
- Tree of Life Pendant - $1,450

### Chains (4 items)
- Cuban Link Chain 22K - $4,500
- Rope Chain 18K Gold - $2,200
- Box Chain 14K Gold - $1,200
- Figaro Chain 22K Gold - $3,800

### Bangles (4 items)
- Traditional Gold Bangle - $2,800
- Diamond Bangle Set - $5,200
- Hinged Bangle 18K - $1,950
- Open Cuff Bangle - $1,250

### Anklets (3 items)
- Delicate Gold Anklet - $450
- Chain Anklet with Pendant - $680
- Beaded Anklet - $380

### Brooches (3 items)
- Vintage Floral Brooch - $2,200
- Art Deco Brooch - $3,200
- Butterfly Brooch Diamond - $4,800

### Watches (4 items)
- Luxury Gold Watch - $12,500
- Diamond Watch 22K - $18,500 (with video)
- Vintage Gold Watch - $6,800
- Sport Gold Watch - $9,500

## Features

- **In-Memory Cache**: Fast access to all inventory data
- **Automatic Initialization**: Data loads on first access
- **Category Filtering**: Filter by any category
- **Search Ready**: Easy to extend with search functionality
- **Video Support**: Some items include video showcases

## Data Structure

Each item includes:
- Unique ID
- Name and description
- Category classification
- Price in USD
- Weight (in grams)
- Material and karat (for gold items)
- Image paths (ready for your images)
- Video paths (optional)
- Stock status
- SKU number
- Timestamps

## Adding Your Images

Place your images in the following structure:
```
public/
  images/
    rings/
    necklaces/
    earrings/
    bracelets/
    pendants/
    chains/
    bangles/
    anklets/
    brooches/
    watches/
  videos/
    (same structure)
```

The sample data references these paths, so when you add your images with matching filenames, they will automatically display.









