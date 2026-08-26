"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logout confirmation modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // -------------------------
  // GET PROFILE + ORDERS
  // -------------------------

  useEffect(() => {
    const token = localStorage.getItem("token");

    // User is not logged in
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        // =========================
        // GET PROFILE
        // =========================

        const profileResponse = await fetch(
          "http://localhost:8000/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Token expired / invalid
        if (profileResponse.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!profileResponse.ok) {
          throw new Error("Failed to load profile");
        }

        const profileData = await profileResponse.json();

        setProfile(profileData);

        // =========================
        // GET USER ORDERS
        // =========================

        const ordersResponse = await fetch(
          "http://localhost:8000/orders",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (ordersResponse.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!ordersResponse.ok) {
          throw new Error("Failed to load orders");
        }

        const ordersData = await ordersResponse.json();

        setOrders(ordersData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // -------------------------
  // LOGOUT ACTION
  // -------------------------

  function handleLogout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("cartWishlistUpdated"));
    router.push("/login");
  }

  // -------------------------
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <p className="p-8">
        Loading...
      </p>
    );
  }

  // -------------------------
  // UI
  // -------------------------

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      {/* =========================
          PROFILE CARD
      ========================= */}

      <div className="rounded-2xl bg-white p-8 shadow-sm">
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="rounded-lg border border-red-500 px-4 py-2 cursor-pointer font-medium text-red-500 hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* DIVIDER */}

        <div className="my-8 border-t"></div>

        {/* PROFILE INFORMATION */}

        <div className="space-y-6">
          {/* NAME */}

          <div>
            <p className="text-sm text-gray-500">
              Name
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {profile?.name}
            </p>
          </div>

          {/* EMAIL */}

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {profile?.email}
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          ORDER HISTORY
      ========================= */}

      <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">
          Order History
        </h2>

        <div className="my-6 border-t"></div>

        {orders.length === 0 ? (
          <p className="text-gray-500">
            You have not placed any orders yet.
          </p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.orderUuid}
                className="rounded-xl border border-gray-200 p-5"
              >
                {/* ORDER HEADER */}

                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="font-medium text-gray-900">
                      {order.orderNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Status
                    </p>

                    <p className="font-semibold capitalize text-blue-600">
                      {order.status}
                    </p>
                  </div>
                </div>

                {/* ORDER DATE */}

                <p className="mt-3 text-sm text-gray-500">
                  Ordered on{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                {/* PRODUCTS */}

                <div className="mt-5 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.productUuid}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.title}
                        </p>

                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold text-gray-900">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                {/* TOTAL */}

                <div className="mt-5 flex justify-between border-t pt-4">
                  <span className="font-medium text-gray-700">
                    Total
                  </span>

                  <span className="text-lg font-bold text-gray-900">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ⚠️ LOGOUT CONFIRMATION MODAL                               */}
      {/* ========================================================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Are you sure you want to logout?
            </h3>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm cursor-pointer font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm cursor-pointer font-medium text-white hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}