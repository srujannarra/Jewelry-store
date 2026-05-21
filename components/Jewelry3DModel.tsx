"use client";

import { useEffect, useRef } from "react";

interface Jewelry3DModelProps {
  category: string;
  name: string;
  className?: string;
}

export default function Jewelry3DModel({
  category,
  name,
  className = "",
}: Jewelry3DModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#f8f9fa");
    bgGradient.addColorStop(1, "#e9ecef");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw luxury jewelry shape based on category
    const lowerCategory = category.toLowerCase();
    const time = Date.now() / 2000; // Slow rotation

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.sin(time) * 0.1); // Subtle rotation

    // Draw based on category
    if (lowerCategory.includes("ring")) {
      drawRing(ctx, centerX, centerY, 120);
    } else if (lowerCategory.includes("necklace")) {
      drawNecklace(ctx, centerX, centerY, 150);
    } else if (lowerCategory.includes("earring")) {
      drawEarrings(ctx, centerX, centerY, 100);
    } else if (lowerCategory.includes("bracelet")) {
      drawBracelet(ctx, centerX, centerY, 130);
    } else if (lowerCategory.includes("watch")) {
      drawWatch(ctx, centerX, centerY, 140);
    } else {
      drawGenericJewelry(ctx, centerX, centerY, 120);
    }

    ctx.restore();

    // Add shine effect
    const shineGradient = ctx.createRadialGradient(
      centerX - 50,
      centerY - 50,
      0,
      centerX - 50,
      centerY - 50,
      200
    );
    shineGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    shineGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shineGradient;
    ctx.fillRect(0, 0, width, height);
  }, [category, name]);

  function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    // Ring band
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Diamond/Gem
    ctx.fillStyle = "#f0f0f0";
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.4);
    ctx.lineTo(x + size * 0.15, y - size * 0.2);
    ctx.lineTo(x, y);
    ctx.lineTo(x - size * 0.15, y - size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Highlights
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawNecklace(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    // Chain
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI);
    ctx.stroke();

    // Pendant
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.3, size * 0.2, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEarrings(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    // Left earring
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.arc(x - size * 0.4, y, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Right earring
    ctx.beginPath();
    ctx.arc(x + size * 0.4, y, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBracelet(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawWatch(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    // Watch face
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Band
    ctx.fillStyle = "#d4af37";
    ctx.fillRect(x - size * 0.5, y + size * 0.4, size, size * 0.2);
    ctx.fillRect(x - size * 0.5, y - size * 0.6, size, size * 0.2);
  }

  function drawGenericJewelry(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className={className}
      style={{ display: "block" }}
    />
  );
}




