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
    return <p className="p-6">Loading orders...</p>;
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

  return (
    <div className="p-6">

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Orders
        </h1>

        <p className="text-gray-500">
          Manage customer orders
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">

        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">
                Order ID
              </th>

              <th className="px-4 py-3 text-left">
                Customer
              </th>

              <th className="px-4 py-3 text-left">
                Items
              </th>

              <th className="px-4 py-3 text-left">
                Total
              </th>

              <th className="px-4 py-3 text-left">
                Status
              </th>

              <th className="px-4 py-3 text-left">
                Date
              </th>
            </tr>
          </thead>

          <tbody>

            {orders.map((order) => (
              <tr
                key={order.orderUuid}
                className="border-t"
              >

                <td className="px-4 py-4 font-medium">
                  {order.orderUuid}
                </td>

                <td className="px-4 py-4">
                  <p className="font-medium">
                    {order.customer.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {order.customer.email}
                  </p>
                </td>

                <td className="px-4 py-4">
                  {order.items.length}
                </td>

                <td className="px-4 py-4">
                  ₹{order.totalAmount}
                </td>

                <td className="px-4 py-4">

                    <select
                        value={order.status}
                        onChange={(e) =>
                        updateOrderStatus(order.orderUuid,e.target.value)
                        }
                        className="rounded-lg border px-3 py-2"
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

                <td className="px-4 py-4">
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString("en-IN")}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
}