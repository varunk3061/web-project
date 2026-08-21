"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductDetails({ params }) {
  const router = useRouter();

  const [product, setProduct] = useState(null);

  // Currently selected variant
  const [selectedVariant, setSelectedVariant] =
    useState(null);

  // =========================
  // ADD TO CART
  // =========================

  async function addToCart() {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:8000/cart",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            productUuid: product.productUuid,

            quantity: 1,

            // Send selected variant
            variantUuid:
              selectedVariant?.variantUuid || null,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");

        router.push("/login");

        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            data.detail ||
            "Failed to add product"
        );

        return;
      }

      window.dispatchEvent(
        new Event("cartWishlistUpdated")
      );

      alert(
        data.message ||
          "Product added to cart!"
      );
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }
  }

  // =========================
  // GET PRODUCT
  // =========================

  useEffect(() => {
    async function getProduct() {
      const { productUuid } = await params;

      const response = await fetch(
        `http://localhost:8000/products/${productUuid}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data);

        return;
      }

      setProduct(data);

      // Select first variant by default
      if (
        data.variants &&
        data.variants.length > 0
      ) {
        setSelectedVariant(
          data.variants[0]
        );
      }
    }

    getProduct();
  }, [params]);

  // =========================
  // LOADING
  // =========================

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading...
        </p>
      </div>
    );
  }

  // =========================
  // CURRENT PRICE
  // =========================

  const currentPrice =
    selectedVariant
      ? selectedVariant.price
      : product.price;

  // =========================
  // CURRENT STOCK
  // =========================

  const currentStock =
    selectedVariant
      ? selectedVariant.stock
      : product.stock;

  // =========================
  // BUY NOW
  // =========================

  function buyNow() {
    const variantQuery =
      selectedVariant?.variantUuid
        ? `&variantUuid=${selectedVariant.variantUuid}`
        : "";

    router.push(
      `/checkout?productUuid=${product.productUuid}&quantity=1${variantQuery}`
    );
  }

  // =========================
  // ADD TO WISHLIST
  // =========================

  async function addToWishlist() {
    const token =
      localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:8000/wishlist",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          productUuid:
            product.productUuid,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.detail ||
          "Failed to add to wishlist"
      );

      return;
    }

    window.dispatchEvent(
      new Event("cartWishlistUpdated")
    );

    alert(data.message);
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow-sm">

        <div className="grid gap-10 md:grid-cols-2">

          {/* ================= IMAGE ================= */}

          <div className="rounded-2xl bg-gray-50 p-6">

            <div className="relative h-112.5 w-full">

              {product.imageUrls ? (
                <Image
                  src={product.imageUrls}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image available
                </div>
              )}

            </div>

          </div>


          {/* ================= PRODUCT INFO ================= */}

          <div className="flex flex-col justify-center">

            {/* BRAND */}

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              {product.brand}
            </p>


            {/* TITLE */}

            <h1 className="mt-3 text-4xl font-bold text-gray-900">
              {product.title}
            </h1>


            {/* RATING */}

            <div className="mt-5 flex items-center gap-3">

              <span className="rounded-md bg-green-600 px-3 py-1 text-sm font-semibold text-white">
                {product.rating} ★
              </span>

              <span className="text-sm text-gray-500">
                {product.numReviews} Reviews
              </span>

            </div>


            {/* ================= VARIANTS ================= */}

            {product.variants &&
              product.variants.length > 0 && (

                <div className="mt-6">

                  <h2 className="mb-3 text-lg font-semibold text-gray-900">
                    Select Variant
                  </h2>


                  <div className="flex flex-wrap gap-3">

                    {product.variants.map(
                      (variant) => {

                        const isSelected =
                          selectedVariant?.variantUuid ===
                          variant.variantUuid;

                        const attributeValues =
                          Object.values(
                            variant.attributes || {}
                          );

                        return (
                          <button
                            key={
                              variant.variantUuid
                            }
                            onClick={() =>
                              setSelectedVariant(
                                variant
                              )
                            }
                            disabled={
                              variant.stock ===
                              0
                            }
                            className={`rounded-lg border px-4 py-3 text-left transition ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-gray-300 hover:border-blue-500"
                            } ${
                              variant.stock ===
                              0
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }`}
                          >

                            <div className="font-medium">

                              {attributeValues.join(
                                " / "
                              )}

                            </div>

                            <div className="mt-1 text-sm text-gray-500">

                              ₹
                              {variant.price}

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              )}


            {/* ================= PRICE ================= */}

            <p className="mt-6 text-3xl font-bold text-gray-900">
              ₹{currentPrice}
            </p>


            {/* ================= STOCK ================= */}

            <div className="mt-4">

              {currentStock > 0 ? (

                <p className="font-medium text-green-600">
                  In Stock ({currentStock} available)
                </p>

              ) : (

                <p className="font-medium text-red-600">
                  Out of Stock
                </p>

              )}

            </div>


            {/* DIVIDER */}

            <div className="my-6 border-t border-gray-200" />


            {/* DESCRIPTION */}

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Description
              </h2>

              <p className="mt-2 leading-7 text-gray-600">
                {product.description ||
                  "No description available."}
              </p>

            </div>


            {/* ================= BUTTONS ================= */}

            <div className="mt-8 flex gap-4">

              <button
                onClick={addToCart}
                disabled={currentStock === 0}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Add to Cart
              </button>


              <button
                onClick={buyNow}
                disabled={currentStock === 0}
                className="flex-1 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Buy Now
              </button>

            </div>


            {/* WISHLIST */}

            <div className="mt-4">

              <button
                onClick={addToWishlist}
                className="w-full rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                ♡ Add to Wishlist
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}