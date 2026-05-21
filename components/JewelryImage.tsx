"use client";

import Image from "next/image";

interface JewelryImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function JewelryImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  sizes,
  priority = false,
}: JewelryImageProps) {
  // Use the src directly - no fallback logic
  const imageSrc = src;

  // If fill is true, use fill layout
  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        unoptimized={imageSrc.startsWith("https://")}
      />
    );
  }

  // Otherwise use width/height
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={imageSrc.startsWith("https://")}
    />
  );
}

