"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  MapPin,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'delivered'

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchOrders() {
      try {
        const response = await fetch("http://localhost:8000/orders", {
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

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch orders");
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  // =========================
  // FILTER LOGIC (All, Active, Delivered)
  // =========================
  const filteredOrders = useMemo(() => { /*If something unrelated changes, React doesn't need to perform the filtering calculation again. if the dependcies array was changed then recalculates it*/
    if (filter === "active") {
      return orders.filter((order) => order.status?.toLowerCase() !== "delivered");
    }
    if (filter === "delivered") {
      return orders.filter((order) => order.status?.toLowerCase() === "delivered");
    }
    return orders;
  }, [orders, filter]);

  // Status Styling Configuration
  const getStatusBadge = (status) => {  /*it checks the status of the order and returns an object containing the appropriate styling classes and label for that status.*/
    switch (status?.toLowerCase()) {
      case "delivered":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "Delivered",
        };
      case "shipped":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          label: "Shipped",
        };
      default:
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: "Order Placed",
        };
    }
  };

  // =========================
  // LOADING SKELETON
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-10 w-56 animate-pulse rounded-xl bg-gray-200" />
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-gray-200/80 bg-white p-8 shadow-xs"
            >
              <div className="h-7 w-1/3 rounded-lg bg-gray-200" />
              <div className="my-6 border-t border-gray-100" />
              <div className="h-20 w-full rounded-2xl bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================
  // EMPTY STATE
  // =========================
  if (orders.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50 font-sans">
        <div className="max-w-lg w-full rounded-3xl border border-gray-200/80 bg-white p-10 text-center shadow-xs">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
            <ShoppingBag size={48} />
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            No Orders Placed Yet
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            You haven't placed any orders yet. Discover our top collections and start shopping today!
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold tracking-wide text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
          >
            <span>Start Shopping</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN ORDERS VIEW
  // =========================
  return (
    <div className="min-h-screen bg-gray-50/60 pb-20 pt-10 font-sans antialiased">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title & Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              My Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Check the status and details of your purchases.
            </p>
          </div>

          {/* Filter Tabs (All, Active, Delivered) */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-gray-200/70 p-1.5 self-start sm:self-auto">
            {[
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "delivered", label: "Delivered" },
            ].map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-8">
          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-gray-200/80 bg-white p-12 text-center shadow-xs">
              <Package size={40} className="mx-auto text-gray-400" />
              <p className="mt-4 text-base font-semibold tracking-tight text-gray-900">
                No {filter} orders found
              </p>
              <button
                onClick={() => setFilter("all")}
                className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
              >
                View all orders
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusBadge(order.status);
              const orderIdDisplay = order.orderNumber || order.orderUuid;

              return (
                <div
                  key={order.orderUuid}
                  className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs"
                >
                  {/* 1. Header Bar */}
                  <div className="border-b border-gray-100 bg-gray-50/70 p-6 sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Order ID & Date */}
                      <div>
                        <span className="font-mono text-sm sm:text-base font-bold text-gray-900">
                          Order #{orderIdDisplay}
                        </span>

                        {order.createdAt && (
                          <p className="text-sm text-gray-500 mt-1">
                            Placed on{" "}
                            <span className="font-semibold text-gray-800">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Order Status Badge & Total */}
                      <div className="flex items-center gap-6 sm:gap-8">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            Total Amount
                          </p>
                          <p className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
                            ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold tracking-wide ${statusConfig.bg}`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${statusConfig.dot}`}
                          />
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Items List */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Items ({order.items?.length || 0})
                    </p>

                    <div className="divide-y divide-gray-100">
                      {order.items?.map((item, idx) => (
                        <div
                          key={item.productUuid || idx}
                          className="flex items-center justify-between py-4 gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-gray-400">
                              {item.imageUrls || item.image ? (
                                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                                  <Image
                                    src={item.imageUrls || item.image}
                                    alt={item.title || "Product"}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <Package size={24} />
                              )}
                            </div>

                            <div>
                              <Link
                                href={
                                  item.productUuid
                                    ? `/products/${item.productUuid}`
                                    : "#"
                                }
                                className="text-sm sm:text-base font-bold text-gray-900 hover:text-blue-600 transition line-clamp-1"
                              >
                                {item.title}
                              </Link>

                              <p className="text-sm text-gray-500 mt-1">
                                Qty:{" "}
                                <span className="font-semibold text-gray-800">
                                  {item.quantity}
                                </span>{" "}
                                × ₹{Number(item.price || 0).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>

                          <span className="text-base font-bold text-gray-900 shrink-0">
                            ₹
                            {(
                              Number(item.price || 0) * Number(item.quantity || 1)
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Delivery Address Footer */}
                  {order.shippingAddress && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 sm:p-7">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mt-0.5">
                          <MapPin size={18} />
                        </div>

                        <div className="text-sm leading-relaxed text-gray-600">
                          <p className="text-base font-bold text-gray-900 tracking-tight">
                            Delivery Address
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {order.shippingAddress.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress.line1}
                            {order.shippingAddress.line2 &&
                              `, ${order.shippingAddress.line2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} -{" "}
                            <span className="font-bold text-gray-800">
                              {order.shippingAddress.pincode}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}