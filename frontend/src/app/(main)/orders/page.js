"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchOrders() {
      try {
        const response = await fetch(
          "http://localhost:8000/orders",
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

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to fetch orders"
          );
        }

        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold">
          My Orders
        </h1>

        <div className="mt-8 rounded-xl border bg-white p-8 text-center">
          <p className="text-gray-500">
            You haven't placed any orders yet.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      <h1 className="mb-8 text-3xl font-bold">
        My Orders
      </h1>

      <div className="space-y-6">

        {orders.map((order) => (
          <div
            key={order.orderUuid}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >

            {/* Order Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="font-bold text-gray-900">
                  Order
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Order ID: {order.orderNumber}
                </p>
              </div>

              <span className="w-fit rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold capitalize text-green-700">
                {order.status}
              </span>

            </div>

            <div className="my-6 border-t" />

            {/* Products */}
            <div className="space-y-4">

              {order.items.map((item) => (
                <div
                  key={item.productUuid}
                  className="flex items-center justify-between gap-4"
                >

                  <div>
                    <p className="font-medium text-gray-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      ₹{item.price.toLocaleString("en-IN")} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-gray-900">
                    ₹{(
                      item.price * item.quantity
                    ).toLocaleString("en-IN")}
                  </p>

                </div>
              ))}

            </div>

            <div className="my-6 border-t" />

            {/* Total */}
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span>
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Shipping Address */}
            <div className="mt-6 rounded-xl bg-gray-50 p-5">

              <h3 className="font-semibold text-gray-900">
                Delivery Address
              </h3>

              <div className="mt-3 text-sm leading-6 text-gray-600">

                <p className="font-medium text-gray-900">
                  {order.shippingAddress.fullName}
                </p>

                <p>
                  {order.shippingAddress.line1}
                </p>

                {order.shippingAddress.line2 && (
                  <p>
                    {order.shippingAddress.line2}
                  </p>
                )}

                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state}
                </p>

                <p>
                  {order.shippingAddress.pincode}
                </p>

              </div>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}