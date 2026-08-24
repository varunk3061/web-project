"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export default function Cart() {
  const router = useRouter();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD CART
  // =========================

  async function loadCart() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data);
        return;
      }

      setCart(data);

    } catch (error) {
      console.log(error);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);


  // =========================
  // UPDATE QUANTITY
  // =========================

  async function updateQuantity(
    productUuid,
    variantUuid,
    quantity
  ) {
    const token = localStorage.getItem("token");

    if (quantity < 1) {
      return;
    }

    let url =
      `http://localhost:8000/cart/${productUuid}` +
      `?quantity=${quantity}`;

    // Add variantUuid if this is a variant
    if (variantUuid) {
      url += `&variantUuid=${encodeURIComponent(
        variantUuid
      )}`;
    }

    const response = await fetch(url, {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.message ||
        data.detail ||
        "Failed to update quantity"
      );

      return;
    }

    loadCart();

    window.dispatchEvent(
      new Event("cartWishlistUpdated")
    );
  }


  // =========================
  // REMOVE PRODUCT
  // =========================

  async function removeProduct(
    productUuid,
    variantUuid
  ) {
    const token = localStorage.getItem("token");

    let url =
      `http://localhost:8000/cart/${productUuid}`;

    // Add variantUuid if this is a variant
    if (variantUuid) {
      url += `?variantUuid=${encodeURIComponent(
        variantUuid
      )}`;
    }

    const response = await fetch(url, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.message ||
        data.detail ||
        "Failed to remove product"
      );

      return;
    }

    loadCart();

    window.dispatchEvent(
      new Event("cartWishlistUpdated")
    );
  }


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">
            Loading cart...
          </p>
        </div>
      </div>
    );
  }


  // =========================
  // EMPTY CART
  // =========================

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">

        <div className="text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-4xl">
            🛒
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-500">
            Looks like you haven't added anything to your cart yet.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

        </div>

      </div>
    );
  }


  // =========================
  // TOTALS
  // =========================

  const totalItems = cart.items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const totalPrice = cart.items.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );


  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>

          <p className="mt-1 text-gray-500">
            {totalItems}{" "}
            {totalItems === 1
              ? "item"
              : "items"}{" "}
            in your cart
          </p>

        </div>


        <div className="grid gap-8 lg:grid-cols-3">


          {/* ================= CART ITEMS ================= */}

          <div className="space-y-4 lg:col-span-2">

            {cart.items.map((item) => (

              <div
                key={
                  `${item.productUuid}-${item.variantUuid || "default"}`
                }
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >

                <div className="flex gap-5">


                  {/* IMAGE */}

                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-50">

                    {item.imageUrls ? (

                      <Image
                        src={item.imageUrls}
                        alt={item.title}
                        fill
                        sizes="128px"
                        className="rounded-xl object-contain p-3"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>

                    )}

                  </div>


                  {/* DETAILS */}

                  <div className="flex flex-1 flex-col">

                    <div className="flex justify-between gap-4">

                      <div>

                        <Link
                          href={`/products/${item.productUuid}`}
                          className="text-lg font-semibold text-gray-900 transition hover:text-blue-600"
                        >
                          {item.title}
                        </Link>


                        {/* VARIANT */}

                        {item.attributes &&
                          Object.keys(
                            item.attributes
                          ).length > 0 && (

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">

                              {Object.entries(
                                item.attributes
                              ).map(
                                ([key, value]) => (

                                  <p
                                    key={key}
                                    className="text-sm text-gray-500"
                                  >
                                    <span className="font-medium capitalize text-gray-600">
                                      {key}:
                                    </span>{" "}
                                    {value}
                                  </p>

                                )
                              )}

                            </div>
                          )}


                        {/* PRICE */}

                        <p className="mt-2 text-lg font-bold text-gray-900">
                          ₹
                          {item.price.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>


                      {/* REMOVE */}

                      <button
                        onClick={() =>
                          removeProduct(
                            item.productUuid,
                            item.variantUuid
                          )
                        }
                        className="flex h-fit shrink-0 items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-sm font-medium text-red-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>

                    </div>


                    {/* QUANTITY */}

                    <div className="mt-auto flex items-center gap-3 pt-4">

                      <span className="text-sm text-gray-500">
                        Quantity
                      </span>

                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50">

                        {/* MINUS */}

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productUuid,
                              item.variantUuid,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            item.quantity === 1
                          }
                          className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                        >
                          <Minus size={15} />
                        </button>


                        {/* CURRENT QUANTITY */}

                        <span className="min-w-10 bg-white text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>


                        {/* PLUS */}

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productUuid,
                              item.variantUuid,
                              item.quantity + 1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:bg-white active:scale-95"
                        >
                          <Plus size={15} />
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>


          {/* ================= SUMMARY ================= */}

          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">

            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>


            <div className="mt-6 space-y-4">

              <div className="flex justify-between text-gray-600">

                <span>
                  Items ({totalItems})
                </span>

                <span>
                  ₹
                  {totalPrice.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>


              <div className="flex justify-between text-gray-600">

                <span>
                  Delivery
                </span>

                <span className="font-medium text-green-600">
                  FREE
                </span>

              </div>


              <div className="border-t border-gray-200 pt-4">

                <div className="flex justify-between">

                  <span className="text-lg font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-gray-900">
                    ₹
                    {totalPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

            </div>


            <Link
              href="/checkout"
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-center font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99]"
            >
              Proceed to Checkout
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>


            <Link
              href="/"
              className="mt-3 block text-center text-sm font-medium text-blue-600 hover:underline"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}
