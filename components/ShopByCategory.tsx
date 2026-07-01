"use client";

import Image from "next/image";
import Link from "next/link";
import { Gem } from "lucide-react";
import {
  SHOP_CATEGORIES,
  categoryInventoryHref,
} from "@/lib/categoryMeta";

export default function ShopByCategory() {
  return (
    <section
      className="shop-by-category w-full"
      aria-labelledby="shop-by-category-heading"
    >
      <header className="text-center mb-10 md:mb-14">
        <div className="flex items-center justify-center gap-4 mb-5">
          <span className="h-px w-12 sm:w-16 bg-rose-300/70 dark:bg-rose-500/40" aria-hidden />
          <Gem
            className="h-5 w-5 text-rose-800/80 dark:text-rose-300/90"
            strokeWidth={1.25}
            aria-hidden
          />
          <span className="h-px w-12 sm:w-16 bg-rose-300/70 dark:bg-rose-500/40" aria-hidden />
        </div>
        <h2
          id="shop-by-category-heading"
          className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-[0.22em] text-gray-900 dark:text-gray-50 uppercase"
        >
          Categories
        </h2>
        <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Explore our diverse selections. Find your style.
        </p>
      </header>

      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/60 dark:bg-gray-900/40 p-4 sm:p-6 md:p-8 shadow-sm">
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none m-0 p-0"
          role="list"
        >
          {SHOP_CATEGORIES.map((category) => (
            <li key={category.slug} className="m-0 p-0">
              <Link
                href={categoryInventoryHref(category.slug)}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-800/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-xl"
              >
                <div
                  className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br ${category.surface} shadow-sm transition-shadow duration-300 group-hover:shadow-md`}
                >
                  <Image
                    src={category.image}
                    alt={category.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-4 text-center font-serif text-lg sm:text-xl text-gray-900 dark:text-gray-100 transition-colors duration-200 group-hover:text-rose-900 dark:group-hover:text-rose-200">
                  {category.label}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 md:mt-12 flex justify-center">
        <Link
          href="/inventory"
          className="inline-flex items-center justify-center min-w-[220px] px-8 py-3 text-sm font-medium tracking-wide text-rose-900 dark:text-rose-200 border border-rose-900/70 dark:border-rose-400/60 rounded-sm transition-colors duration-200 hover:bg-rose-900 hover:text-white dark:hover:bg-rose-800 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-800/50 focus-visible:ring-offset-2"
        >
          View All Categories
        </Link>
      </div>
    </section>
  );
}
