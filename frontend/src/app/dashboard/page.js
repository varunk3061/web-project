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

  return (
    <div className="p-6">

      {/* Dashboard Heading */}
      <h1 className="mb-2 text-2xl font-bold">
        Dashboard
      </h1>

      <p className="mb-6 text-gray-500">
        Overview of your store
      </p>

      {/* ================= STATISTICS ================= */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

        {/* Total Orders */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <ShoppingCart className="h-6 w-6 text-blue-600" />

          </div>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.totalOrders}
          </h2>

        </div>


        {/* Total Products */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <Package className="h-6 w-6 text-blue-600" />

          </div>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.totalProducts}
          </h2>

        </div>


        {/* Total Categories */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Total Categories
            </p>

            <Tags className="h-6 w-6 text-blue-600" />

          </div>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.totalCategories}
          </h2>

        </div>


        {/* Total Users */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Total Users
            </p>

            <Users className="h-6 w-6 text-blue-600" />

          </div>

          <h2 className="mt-2 text-3xl font-bold">
            {stats.totalUsers}
          </h2>

        </div>

      </div>


      {/* ================= RECENT ORDERS ================= */}

      <div className="mt-8 rounded-xl border bg-white shadow-sm">

        {/* Section Header */}
        <div className="border-b p-6">

          <h2 className="text-xl font-semibold">
            Recent Orders
          </h2>

          <p className="text-sm text-gray-500">
            Latest orders placed by customers
          </p>

        </div>


        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full">

            {/* Table Header */}
            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Order ID
                </th>

                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Amount
                </th>

                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
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
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No orders found
                  </td>

                </tr>

              ) : (

                recentOrders.map((order) => (

                  <tr
                    key={order.orderUuid}
                    className="border-t"
                  >

                    {/* Order ID */}
                    <td className="px-6 py-4 text-sm font-medium">

                      {order.orderUuid}

                    </td>


                    {/* Customer */}
                    <td className="px-6 py-4 text-sm">

                      {order.customer?.name || "Unknown"}

                    </td>


                    {/* Amount */}
                    <td className="px-6 py-4 text-sm">

                      ₹
                      {order.totalAmount?.toLocaleString("en-IN")}

                    </td>


                    {/* Status */}
                    <td className="px-6 py-4">

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">

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