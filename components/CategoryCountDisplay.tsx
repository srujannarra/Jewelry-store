import { getCategoryCounts } from "@/lib/inventory";
import { getCategories } from "@/lib/inventory";

export default async function CategoryCountDisplay() {
  const categoryCounts = await getCategoryCounts();
  const categories = getCategories().filter((cat) => cat !== "All");

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Inventory by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => {
          const count = categoryCounts[category] || 0;
          return (
            <div
              key={category}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-4 text-center hover:shadow-lg dark:hover:shadow-gray-800 transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {category}
              </h3>
              <p className="text-3xl font-bold text-gold-600 dark:text-gold-400">
                {count}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {count === 1 ? "item" : "items"}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-center">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Total Items:</span>{" "}
          <span className="text-gold-600 dark:text-gold-400 font-bold text-xl">
            {Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)}
          </span>
        </p>
      </div>
    </div>
  );
}
