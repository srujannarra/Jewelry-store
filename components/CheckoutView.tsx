"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Construction,
  Lock,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useRates } from "@/lib/GoldRateContext";
import { computeItemPriceINR, formatINR } from "@/lib/pricing";

import JewelryImage from "./JewelryImage";

export default function CheckoutView() {
  const { items, itemCount, subtotal, isHydrated } = useCart();
  const { rates } = useRates();

  // Step 4 (final verification): recompute every line against the latest live
  // rate so the customer/business is protected from market movement since the
  // item was added to the bag.
  const verifiedTotal = items.reduce(
    (sum, item) => sum + computeItemPriceINR(item, rates) * item.quantity,
    0,
  );
  const priceChanged = Math.abs(verifiedTotal - subtotal) >= 1;

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
        Loading checkout...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Nothing to check out
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your bag is empty. Add a few pieces, then return here for a secure
            checkout.
          </p>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-600 dark:bg-gold-500 text-white font-semibold hover:bg-gold-700 dark:hover:bg-gold-600"
          >
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  const total = verifiedTotal;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-gold-700 dark:text-gold-300 hover:text-gold-800 dark:hover:text-gold-200 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bag
        </Link>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 inline-flex items-center gap-3">
          <Lock className="w-7 h-7 text-gold-600 dark:text-gold-400" />
          Secure Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 flex items-start gap-4">
            <Construction className="w-6 h-6 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-amber-900 dark:text-amber-200">
                Payment gateway not yet connected
              </h2>
              <p className="text-sm text-amber-800 dark:text-amber-300/90 mt-1 leading-relaxed">
                This is a preview of the secure checkout experience. No card
                details are collected on this page. Once a PCI-compliant gateway
                (Stripe, Razorpay, PayPal, etc.) is connected, customers will be
                redirected to the provider&apos;s hosted, encrypted payment form
                to complete their purchase.
              </p>
            </div>
          </div>

          <section className="bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-gray-100 dark:ring-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              What will happen at checkout
            </h3>
            <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300 list-decimal pl-5">
              <li>Your order is locked and sent to our server over HTTPS.</li>
              <li>
                You are redirected to our payment provider&apos;s hosted page
                (we never see or store your card number).
              </li>
              <li>
                The provider verifies your card via 3-D Secure / OTP and
                authorizes the charge.
              </li>
              <li>
                We receive a signed confirmation, generate your invoice, and
                email you a receipt.
              </li>
            </ol>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-gray-100 dark:ring-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Items in this order
            </h3>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {items.map((item) => (
                <li key={item.id} className="py-3 flex gap-4 items-center">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600 shrink-0">
                    {item.image && (
                      <JewelryImage
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Qty {item.quantity} ·{" "}
                      {formatINR(computeItemPriceINR(item, rates))} each
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatINR(computeItemPriceINR(item, rates) * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-[140px] bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-gray-100 dark:ring-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Order Summary
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <dt>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {formatINR(verifiedTotal)}
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

            {priceChanged && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3">
                <TrendingUp className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  Prices were re-verified against the live gold rate and updated
                  from {formatINR(subtotal)}. The total below reflects the
                  current rate.
                </p>
              </div>
            )}

            <div className="my-5 h-px bg-gray-100 dark:bg-gray-700" />

            <div className="flex items-end justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Total
              </span>
              <span className="text-2xl font-extrabold text-gold-700 dark:text-gold-300">
                {formatINR(total)}
              </span>
            </div>
            <p className="mt-1 flex items-center justify-end gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <RefreshCw className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
              Live price verified · inclusive of GST
            </p>

            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Payment gateway not connected yet"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              Pay Securely (coming soon)
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 text-center">
              <ShieldCheck className="w-4 h-4 text-gold-600 dark:text-gold-400" />
              We never store your card. Payments are handled by a PCI-DSS
              certified provider.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
