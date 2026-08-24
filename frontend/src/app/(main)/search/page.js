"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default function SearchPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");

  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:8000/products");
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // ==========================================
  // FILTER & SORT PRODUCTS
  // ==========================================
  const filteredAndSortedProducts = useMemo(() => {
    const q = query.toLowerCase().trim();

    // 1. Filter by Title, Brand, or Description
    let result = products.filter((product) => {
      if (!q) return true;
      return (
        product.title?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q)
      );
    });

    // 2. Apply Sorting
    if (sortBy === "price-low") {
      result = [...result].sort(
        (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
      );
    } else if (sortBy === "price-high") {
      result = [...result].sort(
        (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)
      );
    } else if (sortBy === "rating") {
      result = [...result].sort(
        (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)
      );
    }

    return result;
  }, [products, query, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= BREADCRUMBS ================= */}
        <nav className="mb-4 flex items-center gap-2 text-xs font-medium text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800">Search</span>
          {query && (
            <>
              <ChevronRight size={13} className="text-gray-400" />
              <span className="text-blue-600 font-semibold truncate max-w-xs">
                "{query}"
              </span>
            </>
          )}
        </nav>

        {/* ================= HEADER & SORT CONTROLS ================= */}
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {query ? (
                  <>
                    Results for{" "}
                    <span className="text-blue-600 font-extrabold">
                      "{query}"
                    </span>
                  </>
                ) : (
                  "All Products"
                )}
              </h1>
              {!loading && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                  {filteredAndSortedProducts.length}{" "}
                  {filteredAndSortedProducts.length === 1 ? "Item" : "Items"}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Showing matching products available for quick delivery
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Sort By:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50/70 py-2 pl-3.5 pr-9 text-xs font-semibold text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="featured">Featured / Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
              <ArrowUpDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* ================= CONTENT / PRODUCTS GRID ================= */}
        {loading ? (
          /* SKELETON LOADING GRID */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-gray-200/80 bg-white p-4 shadow-xs"
              >
                <div className="h-48 w-full rounded-2xl bg-gray-100" />
                <div className="mt-4 h-4 w-3/4 rounded-md bg-gray-100" />
                <div className="mt-2 h-3.5 w-1/2 rounded-md bg-gray-100" />
                <div className="mt-5 flex items-center justify-between">
                  <div className="h-6 w-1/3 rounded-md bg-gray-100" />
                  <div className="h-9 w-20 rounded-xl bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white p-10 text-center shadow-xs">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <Search size={36} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No products found for "{query}"
            </h2>

            <p className="mt-1.5 max-w-sm text-xs text-gray-500">
              We couldn't find any products matching your search. Please check for spelling errors or try different keywords.
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
            >
              <span>Explore All Products</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          /* PRODUCT GRID */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredAndSortedProducts.map((product) => (
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