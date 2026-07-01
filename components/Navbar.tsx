"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, ShoppingCart, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import GoldRateDisplay from "./GoldRateDisplay";
import { useCart } from "@/lib/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { itemCount, isHydrated } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Shri Vasavi Jewellers"
                  width={200}
                  height={80}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </Link>
              <div className="flex gap-6 items-center">
                <div className="w-9 h-9"></div>
                <Link href="/" className="text-gray-700 dark:text-gray-300">
                  Home
                </Link>
                <Link href="/inventory" className="text-gray-700 dark:text-gray-300">
                  Inventory
                </Link>
                <Link href="/about" className="text-gray-700 dark:text-gray-300">
                  About
                </Link>
                <div className="w-9 h-9"></div>
              </div>
            </div>
          </div>
        </nav>
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky top-[73px] z-40 transition-colors">
          <div className="container mx-auto px-4 py-2">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Loading gold rate...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Shri Vasavi Jewellers"
                width={200}
                height={80}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>
            <div className="flex gap-6 items-center">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <Link
                href="/"
                className={`hover:text-gold-600 dark:hover:text-gold-400 transition-colors ${
                  pathname === "/"
                    ? "text-gold-600 dark:text-gold-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Home
              </Link>
              <Link
                href="/inventory"
                className={`hover:text-gold-600 dark:hover:text-gold-400 transition-colors ${
                  pathname === "/inventory"
                    ? "text-gold-600 dark:text-gold-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Inventory
              </Link>
              <Link
                href="/about"
                className={`hover:text-gold-600 dark:hover:text-gold-400 transition-colors ${
                  pathname === "/about"
                    ? "text-gold-600 dark:text-gold-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                About
              </Link>
              <Link
                href="/cart"
                aria-label="View shopping cart"
                className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  pathname === "/cart"
                    ? "text-gold-600 dark:text-gold-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isHydrated && itemCount > 0 && (
                  <span
                    aria-label={`${itemCount} items in cart`}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold-600 dark:bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Gold Rate Display at Bottom of Navbar */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky top-[73px] z-40 transition-colors">
        <div className="container mx-auto px-4 py-2">
          <GoldRateDisplay />
        </div>
      </div>
    </>
  );
}

