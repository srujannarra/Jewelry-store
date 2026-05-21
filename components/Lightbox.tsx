"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-amber-400 transition-colors p-2 rounded-full bg-black/50 hover:bg-black/70"
          aria-label="Close lightbox"
        >
          <X size={24} />
        </button>

        {/* Main Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
            unoptimized={images[currentIndex].startsWith("https://")}
          />
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-amber-400 transition-colors p-3 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-50"
              disabled={currentIndex === 0}
              aria-label="Previous image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-amber-400 transition-colors p-3 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-50"
              disabled={currentIndex === images.length - 1}
              aria-label="Next image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  // Navigate to this image
                  const event = new CustomEvent("lightbox-navigate", { detail: index });
                  window.dispatchEvent(event);
                }}
                className={`relative w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-amber-400 scale-110"
                    : "border-white/30 hover:border-white/60"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={img.startsWith("https://")}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}








