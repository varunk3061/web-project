"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
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

        if (!response.ok) {
          console.log(data);
          return;
        }

        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  const updateOrderStatus = async (orderUuid, newStatus) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8000/admin/orders/${orderUuid}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log(data);
      alert(data.detail || "Failed to update status");
      return;
    }

    // Update frontend state
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.orderUuid === orderUuid
          ? { ...order, status: newStatus }
          : order
      )
    );

  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};

  // Purely presentational helper - maps a status string to select-box
  // colors. Does not touch orders state or updateOrderStatus above.
  function getStatusClasses(status) {
    switch (status) {
      case "delivered":
        return "border-green-200 bg-green-50 text-green-700";
      case "shipped":
        return "border-purple-200 bg-purple-50 text-purple-700";
      default:
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders
          </h1>

          <p className="mt-1 text-gray-500">
            Manage customer orders
          </p>
        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          {orders.length} {orders.length === 1 ? "Order" : "Orders"}
        </div>

      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Order ID
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Items
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {orders.length === 0 ? (

                <tr>
                  <td colSpan="6" className="px-6 py-14 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>

              ) : (

                orders.map((order) => (
                <tr
                  key={order.orderUuid}
                  className="transition hover:bg-gray-50"
                >

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {order.customer.email}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.items.length}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₹{order.totalAmount}
                  </td>

                  <td className="px-6 py-4">

                      <select
                          value={order.status}
                          onChange={(e) =>
                          updateOrderStatus(order.orderUuid,e.target.value)
                          }
                          className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 focus:ring-blue-100 ${getStatusClasses(order.status)}`}
                          >

                          <option value="placed">
                          Placed
                          </option>

                          <option value="shipped">
                          Shipped
                          </option>

                          <option value="delivered">
                          Delivered
                          </option>

                      </select>

                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("en-IN")}
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
