"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // TOAST STATE
  // =========================

  const [toast, setToast] = useState(null);

  // =========================
  // AUTO HIDE TOAST
  // =========================

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  // =========================
  // SHOW TOAST
  // =========================

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };

  // =========================
  // GET WISHLIST
  // =========================

  async function fetchWishlist() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:8000/wishlist",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to load wishlist"
        );
      }

      setWishlist(data);

    } catch (error) {
      console.error(error);

      setError(
        error.message || "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================
  // ADD TO CART
  // =========================

  async function addToCart(productUuid, variantUuid) {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // ==========================================
      // STEP 1: ADD PRODUCT TO CART
      // ==========================================

      console.log("Sending POST /cart");

      const cartResponse = await fetch(
        "http://localhost:8000/cart",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            productUuid: productUuid,
            quantity: 1,
            variantUuid: variantUuid || null,
          }),
        }
      );

      console.log(
        "POST /cart status:",
        cartResponse.status
      );

      const cartData = await cartResponse.json();

      // ==========================================
      // CHECK AUTH
      // ==========================================

      if (cartResponse.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // ==========================================
      // CART FAILED
      // ==========================================

      if (!cartResponse.ok) {
        showToast(
          cartData.detail ||
            cartData.message ||
            "Failed to add product to cart",
          "error"
        );

        return;
      }

      // ==========================================
      // STEP 2: REMOVE SAME ITEM FROM WISHLIST
      // ==========================================

      const wishlistUrl = variantUuid
        ? `http://localhost:8000/wishlist/${productUuid}?variantUuid=${variantUuid}`
        : `http://localhost:8000/wishlist/${productUuid}`;

      console.log(
        "Sending DELETE:",
        wishlistUrl
      );

      const wishlistResponse = await fetch(
        wishlistUrl,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "DELETE /wishlist status:",
        wishlistResponse.status
      );

      const wishlistData =
        await wishlistResponse.json();

      // ==========================================
      // WISHLIST REMOVE FAILED
      // ==========================================

      if (!wishlistResponse.ok) {
        showToast(
          wishlistData.detail ||
            wishlistData.message ||
            "Product added to cart, but could not be removed from wishlist.",
          "error"
        );

        // Get latest wishlist from backend
        fetchWishlist();

        return;
      }

      // ==========================================
      // STEP 3: REMOVE FROM UI
      // ==========================================

      setWishlist((previousWishlist) => {
        if (!previousWishlist) {
          return previousWishlist;
        }

        return {
          ...previousWishlist,

          items: previousWishlist.items.filter(
            (item) =>
              !(
                item.productUuid === productUuid &&
                item.variantUuid === variantUuid
              )
          ),
        };
      });

      // ==========================================
      // UPDATE NAVBAR COUNTS
      // ==========================================

      window.dispatchEvent(
        new Event("cartWishlistUpdated")
      );

      // ==========================================
      // SUCCESS
      // ==========================================

      showToast(
        "Product added to cart!",
        "success"
      );

    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      showToast(
        "Something went wrong. Please try again.",
        "error"
      );
    }
  }

  // =========================
  // REMOVE FROM WISHLIST
  // =========================

  async function removeFromWishlist(
    productUuid,
    variantUuid
  ) {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // ==========================================
      // CREATE DELETE URL
      // ==========================================

      const url = variantUuid
        ? `http://localhost:8000/wishlist/${productUuid}?variantUuid=${variantUuid}`
        : `http://localhost:8000/wishlist/${productUuid}`;

      console.log(
        "Sending DELETE:",
        url
      );

      // ==========================================
      // DELETE REQUEST
      // ==========================================

      const response = await fetch(url, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "DELETE /wishlist status:",
        response.status
      );

      const data = await response.json();

      // ==========================================
      // CHECK AUTH
      // ==========================================

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // ==========================================
      // DELETE FAILED
      // ==========================================

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to remove product"
        );
      }

      // ==========================================
      // REMOVE FROM UI
      // ==========================================

      setWishlist((previousWishlist) => {
        if (!previousWishlist) {
          return previousWishlist;
        }

        return {
          ...previousWishlist,

          items: previousWishlist.items.filter(
            (item) =>
              !(
                item.productUuid === productUuid &&
                item.variantUuid === variantUuid
              )
          ),
        };
      });

      // ==========================================
      // UPDATE NAVBAR COUNTS
      // ==========================================

      window.dispatchEvent(
        new Event("cartWishlistUpdated")
      );

      // ==========================================
      // SUCCESS
      // ==========================================

      showToast(
        data.message ||
          "Product removed from wishlist!",
        "success"
      );

    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong"
      );

      showToast(
        error.message ||
          "Something went wrong",
        "error"
      );
    }
  }

  // =========================
  // FETCH WHEN PAGE LOADS
  // =========================

  useEffect(() => {
    fetchWishlist();
  }, []);

  // =========================
  // TOAST COMPONENT
  // =========================

  const Toast = () => {
    if (!toast) {
      return null;
    }

    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 text-sm font-medium text-gray-900 shadow-xl shadow-gray-200/60">

        {/* ICON */}

        {toast.type === "success" ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle size={20} />
          </div>
        )}

        {/* MESSAGE */}

        <div className="pr-2">
          <p className="font-semibold text-gray-900">
            {toast.type === "success"
              ? "Success!"
              : "Notice"}
          </p>

          <p className="text-xs text-gray-500">
            {toast.message}
          </p>
        </div>

        {/* CLOSE */}

        <button
          type="button"
          onClick={() => setToast(null)}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">

        <Toast />

        <div className="flex flex-col items-center gap-3">

          <Loader2
            size={35}
            className="animate-spin text-blue-600"
          />

          <p className="text-lg text-gray-500">
            Loading wishlist...
          </p>

        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !wishlist) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">

        <Toast />

        <p className="text-red-600">
          {error}
        </p>

      </div>
    );
  }

  // =========================
  // EMPTY WISHLIST
  // =========================

  if (
    !wishlist ||
    wishlist.items.length === 0
  ) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6">

        <Toast />

        <div className="text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-4xl">
            ♡
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Your wishlist is empty
          </h1>

          <p className="mt-2 text-gray-500">
            Add products to your wishlist and
            they will appear here.
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Continue Shopping
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // WISHLIST
  // =========================

  return (
    <div className="relative min-h-screen bg-gray-100 px-6 py-8">

      {/* TOAST */}

      <Toast />

      <div className="mx-auto max-w-6xl">

        {/* PAGE TITLE */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            My Wishlist
          </h1>

          <p className="mt-1 text-gray-500">

            {wishlist.items.length}{" "}

            {wishlist.items.length === 1
              ? "product"
              : "products"}{" "}

            in your wishlist

          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* PRODUCTS */}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          {wishlist.items.map((product) => (
            <div
              key={`${product.productUuid}-${product.variantUuid || "default"}`}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >

              {/* IMAGE */}

              <div className="h-64 bg-gray-50">

                {product.imageUrls ? (
                  <img
                    src={product.imageUrls}
                    alt={product.title}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}

              </div>

              {/* DETAILS */}

              <div className="p-4">

                {/* TITLE */}

                <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">
                  {product.title}
                </h2>

                {/* PRICE */}

                <p className="mt-2 text-xl font-bold text-gray-900">
                  ₹
                  {Number(
                    product.price || 0
                  ).toLocaleString("en-IN")}
                </p>

                {/* RATING */}

                <p className="mt-2 text-sm text-gray-600">
                  ⭐ {product.rating || 4.5}
                </p>

                {/* BUTTONS */}

                <div className="mt-4 flex gap-2">

                  {/* ADD TO CART */}

                  <button
                    type="button"
                    onClick={() =>
                      addToCart(
                        product.productUuid,
                        product.variantUuid
                      )
                    }
                    className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>

                  {/* REMOVE */}

                  <button
                    type="button"
                    onClick={() =>
                      removeFromWishlist(
                        product.productUuid,
                        product.variantUuid
                      )
                    }
                    className="flex-1 cursor-pointer rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                  >
                    Remove
                  </button>

                </div>

                {/* VIEW DETAILS */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/products/${product.productUuid}`
                    )
                  }
                  className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  View Details
                </button>

              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}