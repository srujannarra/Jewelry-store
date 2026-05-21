import { Suspense } from "react";
import CategoryCountDisplay from "@/components/CategoryCountDisplay";

export default async function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          About Shri Vasavi Jewellers
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Welcome to Shri Vasavi Jewellers, where tradition meets elegance. 
            We are dedicated to providing you with the finest collection of jewelry 
            that reflects timeless beauty and craftsmanship.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            Our Story
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Shri Vasavi Jewellers has been a trusted name in the jewelry industry, 
            offering exquisite pieces that celebrate special moments in your life. 
            Our collection features a wide range of designs, from traditional to contemporary, 
            all crafted with precision and care.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            Our Collection
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We offer a diverse selection of jewelry including rings, necklaces, earrings, 
            bracelets, pendants, chains, bangles, anklets, brooches, and watches. 
            Each piece is carefully selected to ensure quality and authenticity.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            Quality Assurance
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            At Shri Vasavi Jewellers, we are committed to providing only the highest quality 
            jewelry. All our pieces are made from premium materials including gold, silver, 
            and platinum, with detailed specifications for karat purity and weight.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            We are here to help you find the perfect piece of jewelry. 
            Browse our inventory or visit us to experience our collection in person.
          </p>
        </div>

        {/* Category Count Display */}
        <Suspense fallback={<div className="mt-12 text-gray-600 dark:text-gray-400">Loading inventory counts...</div>}>
          <CategoryCountDisplay />
        </Suspense>
      </div>
    </div>
  );
}
