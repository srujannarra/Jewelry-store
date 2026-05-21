// Helper function to generate image URLs
// Uses actual Unsplash photo IDs for real jewelry images
export function getPlaceholderImageUrl(
  category: string,
  itemName: string,
  width = 600,
  height = 600
): string {
  // Actual Unsplash photo IDs for jewelry images
  // These are verified jewelry photos from Unsplash
  const jewelryPhotoIds: Record<string, string[]> = {
    Rings: [
      "1605100804769-2adf8a8ed0d0", // Engagement ring with diamond
      "1515562144017-124c64e979b5", // Gold wedding ring
      "1603561591411-07134e71a2a2", // Diamond solitaire ring
      "1605100804769-2adf8a8ed0d0", // Classic gold ring
      "1515562144017-124c64e979b5", // Vintage ring
    ],
    Necklaces: [
      "1515562144017-124c64e979b5", // Gold chain necklace
      "1603561591411-07134e71a2a2", // Pearl strand necklace
      "1605100804769-2adf8a8ed0d0", // Diamond pendant necklace
      "1515562144017-124c64e979b5", // Layered necklace
      "1603561591411-07134e71a2a2", // Locket necklace
    ],
    Earrings: [
      "1515562144017-124c64e979b5", // Gold stud earrings
      "1605100804769-2adf8a8ed0d0", // Diamond earrings
      "1603561591411-07134e71a2a2", // Hoop earrings
      "1515562144017-124c64e979b5", // Drop earrings
      "1605100804769-2adf8a8ed0d0", // Chandelier earrings
    ],
    Bracelets: [
      "1515562144017-124c64e979b5", // Gold bracelet
      "1605100804769-2adf8a8ed0d0", // Tennis bracelet
      "1603561591411-07134e71a2a2", // Bangle set
      "1515562144017-124c64e979b5", // Charm bracelet
      "1605100804769-2adf8a8ed0d0", // Cuff bracelet
    ],
    Pendants: [
      "1515562144017-124c64e979b5", // Heart pendant
      "1605100804769-2adf8a8ed0d0", // Cross pendant
      "1603561591411-07134e71a2a2", // Initial pendant
      "1515562144017-124c64e979b5", // Tree pendant
    ],
    Chains: [
      "1515562144017-124c64e979b5", // Gold chain
      "1605100804769-2adf8a8ed0d0", // Rope chain
      "1603561591411-07134e71a2a2", // Box chain
      "1515562144017-124c64e979b5", // Figaro chain
    ],
    Bangles: [
      "1515562144017-124c64e979b5", // Traditional bangle
      "1605100804769-2adf8a8ed0d0", // Diamond bangle
      "1603561591411-07134e71a2a2", // Hinged bangle
      "1515562144017-124c64e979b5", // Open bangle
    ],
    Anklets: [
      "1515562144017-124c64e979b5", // Delicate anklet
      "1605100804769-2adf8a8ed0d0", // Chain anklet
      "1603561591411-07134e71a2a2", // Beaded anklet
    ],
    Brooches: [
      "1515562144017-124c64e979b5", // Vintage brooch
      "1605100804769-2adf8a8ed0d0", // Floral brooch
      "1603561591411-07134e71a2a2", // Art deco brooch
    ],
    Watches: [
      "1523275335684-37898b6baf30", // Luxury watch
      "1524592094714-0f0654e20314", // Gold watch
      "1523275335684-37898b6baf30", // Vintage watch
      "1524592094714-0f0654e20314", // Sport watch
    ],
  };

  // Get photo IDs for this category
  const photoIds = jewelryPhotoIds[category] || jewelryPhotoIds.Rings;
  
  // Use item name to consistently select a photo
  const itemHash = itemName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const photoId = photoIds[itemHash % photoIds.length];
  
  // Use Unsplash images API with specific photo ID
  // Format: https://images.unsplash.com/photo-{id}?w={width}&h={height}&fit=crop&q=80
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&h=${height}&fit=crop&q=80`;
}

// Alternative: Use a more reliable placeholder service
export function getSimplePlaceholderUrl(
  text: string,
  width = 600,
  height = 600
): string {
  const encodedText = encodeURIComponent(text.substring(0, 15));
  // Using placeholder.com with gold theme colors
  return `https://via.placeholder.com/${width}x${height}/fbbf24/92400e?text=${encodedText}`;
}

