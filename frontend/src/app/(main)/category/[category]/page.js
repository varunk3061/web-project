"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

export default function CategoryPage() {

  const params = useParams(); //useParams() reads the dynamic part of the URL /category/clothes then prams=clothes

  const category = params.category; //it stores categorys like clothes,electronis with help of url

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchProducts() {

      try {

        const response = await fetch(
          `http://localhost:8000/products?category=${encodeURIComponent(category)}` //call get products api with category
        );

        const data = await response.json();

        setProducts(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    }

    if (category) {  //when category changes it call the api again for changed catergories
      fetchProducts();
    }

  }, [category]);


  if (loading) {
    return (
      <p className="p-8">
        Loading products...
      </p>
    );
  }


  return (
    <div className="mx-auto max-w-7xl px-6 py-8">

      <h1 className="mb-6 text-2xl font-bold capitalize">
        {category}
      </h1>

      {products.length === 0 ? (

        <p className="text-gray-500">
          No products found in this category.
        </p>

      ) : (

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          {products.map((product) => (

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