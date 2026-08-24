"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-100 bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            A
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            AuraBazzar <span className="text-blue-600">Admin</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <p className="px-4 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            href="/dashboard/products"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Package size={19} />
            Products
          </Link>

          <Link
            href="/dashboard/categories"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Tags size={19} />
            Categories
          </Link>

          <Link
            href="/dashboard/orders"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <ShoppingCart size={19} />
            Orders
          </Link>

          <Link
            href="/dashboard/users"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Users size={19} />
            Users
          </Link>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => setShowPopup(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* POPUP CONFIRMATION */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Are you sure you want to logout?
            </h3>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}