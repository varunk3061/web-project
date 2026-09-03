"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {ChevronRight,ArrowRight,Package} from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const category = params?.category || "";
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/products?category=${encodeURIComponent(category)}`
        );
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch category products:", error);
      } finally {
        setLoading(false);
      }
    }

    if (category) {
      fetchProducts();
    }
  }, [category]);

  const formattedCategoryName = category? category.charAt(0).toUpperCase() + category.slice(1): "Category";

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= BREADCRUMBS ================= */}
        <nav className="mb-5 flex items-center gap-2 text-xs font-medium text-gray-500">
          <Link href="/" className="transition hover:text-blue-600">
            Home
          </Link>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-500">Category</span>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="font-semibold text-blue-600 capitalize">
            {category}
          </span>
        </nav>

        {/* ================= CATEGORY HEADER BANNER ================= */}
        <div className="mb-8 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl capitalize">
                  {formattedCategoryName}
                </h1>
                {!loading && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                    {products.length} {products.length === 1 ? "Product" : "Products"}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Explore our handpicked collection of quality {category} items.
              </p>
            </div>
          </div>
        </div>

        {/* ================= CONTENT & PRODUCTS GRID ================= */}
        {loading ? (
          /* SKELETON LOADING GRID */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-gray-200/80 bg-white p-4 shadow-xs"
              >
                <div className="h-48 w-full rounded-2xl bg-gray-100" />
                <div className="mt-4 h-4 w-3/4 rounded-md bg-gray-100" />
                <div className="mt-2 h-3.5 w-1/2 rounded-md bg-gray-100" />
                <div className="mt-5 flex items-center justify-between">
                  <div className="h-6 w-1/3 rounded-md bg-gray-100" />
                  <div className="h-8 w-20 rounded-xl bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white p-10 text-center shadow-xs">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <Package size={36} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No products found in "{formattedCategoryName}"
            </h2>

            <p className="mt-1.5 max-w-sm text-xs text-gray-500">
              We haven't added any products to this category yet. Please check back later or explore our other collections.
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
            >
              <span>Explore All Categories</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          /* 4-COLUMN BALANCED PRODUCT GRID */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.productUuid}
                className="flex h-full flex-col transition hover:-translate-y-1 duration-200"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}