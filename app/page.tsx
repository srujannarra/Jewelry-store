import ShopByCategory from "@/components/ShopByCategory";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-wide text-gray-900 dark:text-gray-50 mb-4">
          Welcome to Shri Vasavi Jewellers
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Discover our exquisite collection of fine jewelry, crafted for every
          occasion.
        </p>
      </div>

      <ShopByCategory />
    </div>
  );
}
