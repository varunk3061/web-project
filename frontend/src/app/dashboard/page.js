"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Tags,
  ShoppingCart,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  // Store dashboard statistics
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
  });

  // Store recent orders
  const [recentOrders, setRecentOrders] = useState([]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8000/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch recent orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8000/admin/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        // Show only first 5 orders
        setRecentOrders(data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch recent orders:", error);
      }
    };

    fetchRecentOrders();
  }, []);

  // Purely presentational helper - maps a status string to badge classes.
  // Does not touch stats/recentOrders state or the fetch logic above.
  function getStatusStyles(status) {
    switch ((status || "").toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Dashboard Heading */}
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Dashboard
      </h1>

      <p className="mb-6 text-gray-500">
        Overview of your store
      </p>

      {/* ================= STATISTICS ================= */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

        {/* Total Orders */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-gray-500">
              Total Orders
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>

          </div>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {stats.totalOrders}
          </h2>

        </div>


        {/* Total Products */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-gray-500">
              Total Products
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>

          </div>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {stats.totalProducts}
          </h2>

        </div>


        {/* Total Categories */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-gray-500">
              Total Categories
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Tags className="h-5 w-5 text-amber-600" />
            </div>

          </div>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {stats.totalCategories}
          </h2>

        </div>


        {/* Total Users */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-gray-500">
              Total Users
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <Users className="h-5 w-5 text-green-600" />
            </div>

          </div>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {stats.totalUsers}
          </h2>

        </div>

      </div>


      {/* ================= RECENT ORDERS ================= */}

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6">

          <div>

            <h2 className="text-xl font-semibold text-gray-900">
              Recent Orders
            </h2>

            <p className="text-sm text-gray-500">
              Latest orders placed by customers
            </p>

          </div>

        </div>


        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full">

            {/* Table Header */}
            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Order ID
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

              </tr>

            </thead>


            {/* Table Body */}
            <tbody>

              {recentOrders.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No orders found
                  </td>

                </tr>

              ) : (

                recentOrders.map((order) => (

                  <tr
                    key={order.orderUuid}
                    className="border-t border-gray-100 transition hover:bg-gray-50"
                  >

                    {/* Order ID */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">

                      {order.orderNumber}

                    </td>


                    {/* Customer */}
                    <td className="px-6 py-4 text-sm text-gray-600">

                      {order.customer?.name || "Unknown"}

                    </td>


                    {/* Amount */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">

                      ₹
                      {order.totalAmount?.toLocaleString("en-IN")}

                    </td>


                    {/* Status */}
                    <td className="px-6 py-4">

                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyles(order.status)}`}>

                        {order.status}

                      </span>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
