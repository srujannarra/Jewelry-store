# Jewelry Store Web Application

A modern web application for managing and displaying jewelry inventory with real-time gold rate updates.

## Features

- **Inventory Management**: Complete inventory system with categories (Rings, Necklaces, Earrings, etc.)
- **Real-time Gold Rates**: Automatic gold rate updates every 60 seconds from trusted sources
- **Image & Video Support**: Display inventory items with images and videos
- **Category Filtering**: Filter inventory by jewelry categories
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **TypeScript**: Fully typed for better development experience
- **ESLint & Prettier**: Code quality and formatting tools configured

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ESLint**
- **Prettier**

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
jewelry-store/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── inventory/        # Inventory pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── CategoryFilter.tsx
│   ├── GoldRateDisplay.tsx
│   ├── InventoryCard.tsx
│   ├── InventoryDetail.tsx
│   ├── InventoryGrid.tsx
│   └── Navbar.tsx
├── lib/                   # Utility functions
│   ├── goldRate.ts       # Gold rate API integration
│   └── inventory.ts      # Inventory data management
├── types/                 # TypeScript type definitions
│   └── inventory.ts
└── public/                # Static assets (add your images/videos here)
```

## Adding Your Inventory

1. Place your images in the `public/images/` directory
2. Place your videos in the `public/videos/` directory (optional)
3. Update the `inventoryData` array in `lib/inventory.ts` with your items

Example:
```typescript
{
  id: "unique-id",
  name: "Item Name",
  description: "Item description",
  category: "Rings",
  price: 1500,
  weight: 5.2,
  material: "Gold",
  karat: 18,
  images: ["/images/your-image.jpg"],
  videos: ["/videos/your-video.mp4"], // optional
  inStock: true,
  sku: "SKU-001",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

## Gold Rate API

The application fetches gold rates from `metals.live` API. You can:
- Replace it with a trusted government API
- Use multiple sources for redundancy
- Update the `lib/goldRate.ts` file to use your preferred source

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Code Quality

- ESLint is configured with Next.js recommended rules
- Prettier is configured with Tailwind CSS plugin
- TypeScript strict mode enabled

## Next Steps

1. Add your inventory images and videos to the `public` directory
2. Update the inventory data in `lib/inventory.ts`
3. Configure your preferred gold rate API source
4. Customize the design and branding
5. Add database integration for production use









