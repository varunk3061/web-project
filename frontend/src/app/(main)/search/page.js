"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

export default function SearchPage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get search query from URL
  // Example: /search?query=shoes
  const searchParams = useSearchParams();

  const query = searchParams.get("query") || "";

  useEffect(() => {

    async function fetchProducts() {

      try {

        const response = await fetch(
          "http://localhost:8000/products"
        );

        const data = await response.json();

        setProducts(data);
        setLoading(false);

      } catch (error) {

        console.error(error);
        setLoading(false);

      }
    }

    fetchProducts();

  }, []);

  // Filter products according to search query
  const filteredProducts = products.filter((product) =>
    product.title
      ?.toLowerCase()
      .includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <p className="p-8">
        Loading...
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">

      <h1 className="mb-6 text-2xl font-bold">
        Search results for "{query}"
      </h1>

      {filteredProducts.length === 0 ? (

        <p className="text-gray-500">
          No products found.
        </p>

      ) : (

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          {filteredProducts.map((product) => (

            <ProductCard
              key={product.productUuid}
              product={product}
            />

          ))}

        </div>

      )}

    </div>
  );
}