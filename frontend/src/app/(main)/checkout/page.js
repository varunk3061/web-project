"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {CheckCircle2,AlertCircle,X,Loader2} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productUuid = searchParams.get("productUuid");
  const quantity = Number(searchParams.get("quantity")) || 1;

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Success & Error States
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadCheckoutData() {
      try {
        // ==============================
        // BUY NOW
        // ==============================
        if (productUuid) {
          const response = await fetch(
            `http://localhost:8000/products/${productUuid}`
          );

          if (!response.ok) {
            setErrorMessage("Product not found");
            router.push("/");
            return;
          }

          const product = await response.json();

          setCart([
            {
              productUuid: product.productUuid,
              title: product.title,
              price: product.price,
              quantity: quantity,
            },
          ]);

          setLoading(false);
          return;
        }

        // ==============================
        // NORMAL CART CHECKOUT
        // ==============================
        const response = await fetch("http://localhost:8000/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const data = await response.json();
        setCart(data.items || []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [router, productUuid, quantity]);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function handleAddressChange(e) {
    const { name, value } = e.target;
    setShippingAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ==============================
  // PLACE ORDER
  // ==============================
  async function placeOrder() {
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      setErrorMessage("Please fill in all required address fields.");
      return;
    }


      // Pincode validation
      if (!/^\d{6}$/.test(shippingAddress.pincode)) {
        setErrorMessage("Invalid pincode. Please enter a valid 6-digit pincode.");
        return;
      }

    const token = localStorage.getItem("token");

    try {
      setPlacingOrder(true);

      const response = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: shippingAddress,
          ...(productUuid && {
            productUuid: productUuid,
            quantity: quantity,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Failed to place order"
        );
      }

      // Notify navbar that cart is updated
      window.dispatchEvent(new Event("cartWishlistUpdated"));

      // Show order placed success message
      setPlacedOrderId(data.orderUuid || data.id || null);
      setOrderSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong placing the order.");
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50/60 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
          Checkout
        </h1>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {/* ================= ADDRESS FORM ================= */}
          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">
            <h2 className="text-xl font-bold text-gray-900">
              Delivery Address
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Where would you like us to deliver your order?
            </p>

            <div className="mt-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={shippingAddress.fullName}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="line1"
                  placeholder="House / Flat No., Street, Area"
                  value={shippingAddress.line1}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="line2"
                  placeholder="Apartment, landmark, etc."
                  value={shippingAddress.line2}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="6-digit Pincode"
                  value={shippingAddress.pincode}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* ================= ORDER SUMMARY ================= */}
          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">
            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Review your items and total price
            </p>

            <div className="mt-6 divide-y divide-gray-100">
              {cart.map((item) => (
                <div
                  key={item.productUuid}
                  className="flex items-center justify-between py-3"
                >
                  <div className="pr-4">
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold text-gray-900 text-sm shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-blue-600">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={placeOrder}
              disabled={placingOrder}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl cursor-pointer bg-blue-600 py-3.5 font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50"
            >
              {placingOrder ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Place Order</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🎉 ORDER PLACED SUCCESS POPUP MESSAGE                       */}
      {/* ========================================================= */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl animate-in zoom-in-95">
            {/* Animated Checkmark Circle */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={48} className="animate-pulse" />
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-gray-900">
              Order Placed Successfully!
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Thank you for shopping with us! Your order has been placed and is currently being processed.
            </p>

            {placedOrderId && (
              <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                <span className="text-gray-400">Order ID: </span>
                <span className="font-mono font-bold text-gray-800">
                  #{placedOrderId}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => router.push("/orders")}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm cursor-pointer font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
              >
                View My Orders
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full rounded-xl border border-gray-200 cursor-pointer py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-98"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}