"use client";
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

  const handleLogout = () => {
  localStorage.removeItem("token");

  router.push("/login");
};
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-white">

      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-blue-600">
          AuraBazzar Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">

        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/dashboard/products"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Package size={20} />
          Products
        </Link>

        <Link
          href="/dashboard/categories"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Tags size={20} />
          Categories
        </Link>

        <Link
          href="/dashboard/orders"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <ShoppingCart size={20} />
          Orders
        </Link>

        <Link
          href="/dashboard/users"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Users size={20} />
          Users
        </Link>

      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:bg-red-50"
            >
              <LogOut size={20} />
              Logout
        </button>
      </div>

    </aside>
  );
}