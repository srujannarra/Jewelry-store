"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { formatINR } from "@/lib/pricing";
import JewelryImage from "./JewelryImage";

export default function CartView() {
  const {
    items,
    itemCount,
    subtotal,
    isHydrated,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse text-center text-gray-500 dark:text-gray-400">
          Loading your bag...
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center">
          <div className="mx-auto mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gold-50 dark:bg-gray-800 ring-1 ring-gold-100 dark:ring-gray-700">
            <ShoppingBag className="w-12 h-12 text-gold-600 dark:text-gold-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Your bag is empty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Discover timeless pieces handcrafted with care. When you add a
            favorite, it will appear here, ready for a secure checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inventory"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gold-600 dark:bg-gold-500 text-white font-semibold hover:bg-gold-700 dark:hover:bg-gold-600 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Browse Collection
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-gold-600 dark:border-gold-400 text-gold-700 dark:text-gold-300 font-semibold hover:bg-gold-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-gold-600 dark:text-gold-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Secure Checkout</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">256-bit SSL encryption</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700 flex items-start gap-3">
              <Truck className="w-6 h-6 text-gold-600 dark:text-gold-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Free Shipping</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">On every order</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700 flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-gold-600 dark:text-gold-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Certified Quality</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hallmarked jewelry</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const shipping = 0;
  const estimatedTax = 0;
  const total = subtotal + shipping + estimatedTax;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Shopping Bag
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
          </p>
        </div>
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-gold-700 dark:text-gold-300 hover:text-gold-800 dark:hover:text-gold-200 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-gray-100 dark:ring-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
            {items.map((item) => {
              const lineTotal = item.unitPrice * item.quantity;
              return (
                <li key={item.id} className="p-4 sm:p-6">
                  <div className="flex gap-4 sm:gap-6">
                    <Link
                      href={`/inventory/${item.id}`}
                      className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600"
                    >
                      {item.image ? (
                        <JewelryImage
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/inventory/${item.id}`}
                            className="block font-semibold text-gray-900 dark:text-gray-100 hover:text-gold-700 dark:hover:text-gold-300 truncate"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            SKU: {item.sku}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {item.material && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {item.material}
                              </span>
                            )}
                            {item.karat && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-gold-100 dark:bg-gold-900 text-gold-800 dark:text-gold-200">
                                {item.karat}k
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatINR(lineTotal)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatINR(item.unitPrice)} each
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-lg ring-1 ring-gray-200 dark:ring-gray-600 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 min-w-[2.5rem] text-center font-medium text-gray-900 dark:text-gray-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Clear Bag
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-[140px] bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-gray-100 dark:ring-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Order Summary
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <dt>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {formatINR(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <dt className="inline-flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  Shipping
                </dt>
                <dd className="font-medium text-green-600 dark:text-green-400">Free</dd>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <dt>GST</dt>
                <dd className="text-gray-500 dark:text-gray-400">Included</dd>
              </div>
            </dl>

            <div className="my-5 h-px bg-gray-100 dark:bg-gray-700" />

            <div className="flex items-end justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Total
              </span>
              <span className="text-2xl font-extrabold text-gold-700 dark:text-gold-300">
                {formatINR(total)}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              Inclusive of GST · live gold pricing
            </p>

            <Link
              href="/checkout"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-gold-600 dark:bg-gold-500 text-white font-semibold hover:bg-gold-700 dark:hover:bg-gold-600 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Proceed to Secure Checkout
            </Link>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4 text-gold-600 dark:text-gold-400" />
              256-bit SSL encryption · PCI DSS compliant
            </p>

            <ul className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                Free insured shipping on every order
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                Hallmark certified, ethically sourced
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
