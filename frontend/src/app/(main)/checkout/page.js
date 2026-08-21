"use client";

import { useEffect, useState } from "react";
import { useRouter,useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productUuid = searchParams.get("productUuid");
  const quantity = Number(searchParams.get("quantity")) || 1;

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

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
          alert("Product not found");
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

      const response = await fetch(
        "http://localhost:8000/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  function handleAddressChange(e) {
    const { name, value } = e.target;

    setShippingAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function placeOrder() {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      router.push("/cart");
      return;
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      alert("Please fill all required address fields.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setPlacingOrder(true);

      const response = await fetch(
        "http://localhost:8000/orders",
        {
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
    })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to place order"
        );
      }

      alert("Order placed successfully!");

      router.push("/orders");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <p className="p-8">
        Loading...
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">

      <h1 className="mb-8 text-3xl font-bold">
        Checkout
      </h1>

      <div className="grid gap-8 md:grid-cols-2">

        {/* ================= ADDRESS ================= */}

        <div className="rounded-xl border bg-white p-6">

          <h2 className="text-xl font-bold">
            Delivery Address
          </h2>

          <div className="mt-6 space-y-4">

            {/* Full Name */}
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={shippingAddress.fullName}
              onChange={handleAddressChange}
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />

            {/* Address Line 1 */}
            <input
              type="text"
              name="line1"
              placeholder="Address"
              value={shippingAddress.line1}
              onChange={handleAddressChange}
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />

            {/* Address Line 2 */}
            <input
              type="text"
              name="line2"
              placeholder="Apartment, landmark, etc. (optional)"
              value={shippingAddress.line2}
              onChange={handleAddressChange}
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />

            {/* City */}
            <input
              type="text"
              name="city"
              placeholder="City"
              value={shippingAddress.city}
              onChange={handleAddressChange}
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />

            {/* State */}
            <input
              type="text"
              name="state"
              placeholder="State"
              value={shippingAddress.state}
              onChange={handleAddressChange}
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />

            {/* Pincode */}
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={shippingAddress.pincode}
              onChange={handleAddressChange}
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />

          </div>

        </div>


        {/* ================= ORDER SUMMARY ================= */}

        <div className="rounded-xl border bg-white p-6">

          <h2 className="text-xl font-bold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">

            {cart.map((item) => (
              <div
                key={item.productUuid}
                className="flex justify-between"
              >

                <div>
                  <p className="font-medium">
                    {item.title}
                  </p>

                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹
                  {(
                    item.price * item.quantity
                  ).toLocaleString("en-IN")}
                </p>

              </div>
            ))}

          </div>

          <div className="my-6 border-t"></div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>

            <span>
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={placeOrder}
            disabled={placingOrder}
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {placingOrder
              ? "Placing Order..."
              : "Place Order"}
          </button>

        </div>

      </div>

    </div>
  );
}