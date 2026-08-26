"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Heart,
  ShoppingCart,
} from "lucide-react";

export default function ProductDetails({ params }) {
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Loading states for actions
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isAddingWishlist, setIsAddingWishlist] = useState(false);

  // Custom Toast state { message: string, type: "success" | "error" }
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast after 3.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // =========================
  // ADD TO CART
  // =========================

  async function addToCart() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setIsAddingCart(true);

    try {
      const response = await fetch("http://localhost:8000/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productUuid: product.productUuid,
          quantity: 1,
          // Send selected variant
          variantUuid: selectedVariant?.variantUuid || null,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        showToast(
          data.message || data.detail || "Failed to add product to cart",
          "error"
        );
        return;
      }

      window.dispatchEvent(new Event("cartWishlistUpdated"));

      showToast("Added to your shopping cart!", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsAddingCart(false);
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
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    }

    getProduct();
  }, [params]);

  // =========================
  // LOADING
  // =========================

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm font-medium text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  // =========================
  // CURRENT PRICE & STOCK
  // =========================

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.price;

  const currentStock = selectedVariant
    ? selectedVariant.stock
    : product.stock;

  // =========================
  // BUY NOW
  // =========================

  function buyNow() {
    const variantQuery = selectedVariant?.variantUuid
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
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setIsAddingWishlist(true);

    try {
      const response = await fetch("http://localhost:8000/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productUuid: product.productUuid,
          variantUuid: selectedVariant?.variantUuid || null,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        showToast(
          data.detail || data.message || "Failed to add to wishlist",
          "error"
        );
        return;
      }

      window.dispatchEvent(new Event("cartWishlistUpdated"));

      showToast(data.message || "Added to your wishlist!", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsAddingWishlist(false);
    }
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className="relative min-h-screen bg-gray-50/60 px-4 py-8 sm:px-6 sm:py-10">
      {/* ================= TOAST NOTIFICATION ================= */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 text-sm font-medium text-gray-900 shadow-xl shadow-gray-200/60 transition-all animate-in fade-in slide-in-from-bottom-5">
          {toast.type === "success" ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle size={20} />
            </div>
          )}

          <div className="pr-2">
            <p className="font-semibold text-gray-900">
              {toast.type === "success" ? "Success!" : "Notice"}
            </p>
            <p className="text-xs text-gray-500">{toast.message}</p>
          </div>

          <button
            onClick={() => setToast(null)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ================= MAIN CONTAINER ================= */}
      <div className="mx-auto max-w-6xl rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* ================= IMAGE ================= */}
          <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
            <div className="relative h-96 w-full max-w-md sm:h-112.5">
              {product.imageUrls ? (
                <Image
                  src={product.imageUrls}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain transition-transform duration-300 hover:scale-105"
                  priority
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
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {product.brand}
            </p>

            {/* TITLE */}
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              {product.title}
            </h1>

            {/* RATING */}
            <div className="mt-4 flex items-center gap-3">
              <span className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                <span>{product.rating || "4.5"}</span>
                <span>★</span>
              </span>

              <span className="text-xs font-medium text-gray-500">
                {product.numReviews || 0} Ratings & Reviews
              </span>
            </div>

            {/* ================= VARIANTS ================= */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Select Variant
                </h2>

                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((variant) => {
                    const isSelected =
                      selectedVariant?.variantUuid === variant.variantUuid;

                    const attributeValues = Object.values(
                      variant.attributes || {}
                    );

                    return (
                      <button
                        key={variant.variantUuid}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className={`rounded-xl border px-4 py-2.5 text-left text-xs  cursor-pointer font-semibold transition ${
                          isSelected
                            ? "border-blue-600 cursor-pointer bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-600"
                            : "border-gray-200 bg-white text-gray-700 hover:border-blue-400"
                        } ${
                          variant.stock === 0
                            ? "cursor-not-allowed opacity-40 line-through"
                            : "active:scale-98"
                        }`}
                      >
                        <div>{attributeValues.join(" / ") || "Standard"}</div>
                        <div className="mt-0.5 text-gray-500">
                          ₹{Number(variant.price).toLocaleString("en-IN")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= PRICE ================= */}
            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                ₹{Number(currentPrice || 0).toLocaleString("en-IN")}
              </p>
            </div>

            {/* ================= STOCK STATUS ================= */}
            <div className="mt-3">
              {currentStock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-semibold text-emerald-700">
                    In Stock ({currentStock} available)
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <p className="text-xs font-semibold text-rose-600">
                    Currently Out of Stock
                  </p>
                </div>
              )}
            </div>

            {/* DIVIDER */}
            <div className="my-6 border-t border-gray-100" />

            {/* DESCRIPTION */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Product Description
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {product.description || "No description provided for this product."}
              </p>
            </div>

            {/* ================= BUTTONS ================= */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={addToCart}
                disabled={currentStock === 0 || isAddingCart}
                className="flex flex-1 items-center justify-center cursor-pointer gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isAddingCart ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={buyNow}
                disabled={currentStock === 0}
                className="flex flex-1 items-center justify-center cursor-pointer gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-amber-600 active:scale-98 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Buy Now
              </button>
            </div>

            {/* WISHLIST BUTTON */}
            <div className="mt-3">
              <button
                onClick={addToWishlist}
                disabled={isAddingWishlist}
                className="flex w-full items-center cursor-pointer justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50/40 hover:text-rose-600 active:scale-98 disabled:opacity-50"
              >
                {isAddingWishlist ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-rose-500" />
                    <span>Adding to Wishlist...</span>
                  </>
                ) : (
                  <>
                    <Heart size={16} className="text-rose-500" />
                    <span>Add to Wishlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}