"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  Search,
  ArrowRight,
} from "lucide-react";

export default function SearchPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
  // FILTER PRODUCTS
  // ==========================================
  const q = query.toLowerCase().trim();

  const filteredProducts = products.filter((product) => {
    if (!q) return true;

    return (
      product.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ================= BREADCRUMBS ================= */}

        <nav className="mb-4 flex items-center gap-2 text-xs font-medium text-gray-500">

          <Link
            href="/"
            className="transition hover:text-blue-600"
          >
            Home
          </Link>

          {/* <ChevronRight
            size={13}
            className="text-gray-400"
          /> */}

          {/* {query && (
            <>
              <ChevronRight
                size={13}
                className="text-gray-400"
              />

              <span className="max-w-xs truncate font-semibold text-blue-600">
                "{query}"
              </span>
            </>
          )} */}

        </nav>


        {/* ================= HEADER ================= */}

        <div className="mb-6 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs">

          <div>

            <div className="flex items-center gap-2">

              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">

                {query ? (
                  <>
                    Results for{" "}
                    <span className="font-extrabold text-blue-600">
                      "{query}"
                    </span>
                  </>
                ) : (
                  "All Products"
                )}

              </h1>


              {!loading && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">

                  {filteredProducts.length}{" "}

                  {filteredProducts.length === 1
                    ? "Item"
                    : "Items"}

                </span>
              )}

            </div>


            <p className="mt-1 text-xs text-gray-500">
              Showing matching products available for quick delivery
            </p>

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

        ) : filteredProducts.length === 0 ? (

          /* EMPTY STATE */

          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white p-10 text-center shadow-xs">

            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">

              <Search size={36} />

            </div>


            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No products found for "{query}"
            </h2>


            <p className="mt-1.5 max-w-sm text-xs text-gray-500">
              We couldn't find any products matching your search.
              Please check for spelling errors or try different keywords.
            </p>


            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
            >

              <span>
                Explore All Products
              </span>

              <ArrowRight size={15} />

            </button>

          </div>

        ) : (

          /* PRODUCT GRID */

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {filteredProducts.map((product) => (

              <div
                key={product.productUuid}
                className="flex h-full flex-col transition duration-200 hover:-translate-y-1"
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