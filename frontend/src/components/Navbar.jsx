"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  CircleUserRound,
  Heart
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const router = useRouter();

  // =========================
  // SEARCH
  // =========================

  function handleSearch(e) {
    if (e.key === "Enter" && search.trim() !== "") {
      router.push(
        `/search?query=${encodeURIComponent(search)}`
      );
    }
  }

  // =========================
  // LOAD CART + WISHLIST COUNT
  // =========================

  async function loadCounts() {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (!token) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    try {
      // -------------------------
      // CART
      // -------------------------
      const cartResponse = await fetch("http://localhost:8000/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const totalItems = cartData.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        setCartCount(totalItems);
      }

      // -------------------------
      // WISHLIST
      // -------------------------
      const wishlistResponse = await fetch(
        "http://localhost:8000/wishlist",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        setWishlistCount(wishlistData.items.length);
      }
    } catch (error) {
      console.error("Failed to load counts:", error);
    }
  }

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadCounts();
  }, []);

  // =========================
  // LISTEN FOR CART/WISHLIST CHANGES
  // =========================

  useEffect(() => {
    window.addEventListener("cartWishlistUpdated", loadCounts);

    return () => {
      window.removeEventListener("cartWishlistUpdated", loadCounts);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        {/* LOGO */}
        <Link
          href="/"
          className="flex shrink-0 items-center text-2xl font-bold tracking-wide text-blue-600"
        >
          <Image
            src="/aurabazar.png"
            alt="Flipkart Logo"
            width={140}
            height={72}
            className="object-contain"
            priority
          />
        </Link>

        {/* NAVIGATION */}
        <div className="hidden gap-8 text-sm font-semibold text-gray-700 md:flex">
          <Link
            href="/category/clothes"
            className="relative py-1 transition hover:text-blue-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
          >
            Fashion
          </Link>

          <Link
            href="/category/kitchen"
            className="relative py-1 transition hover:text-blue-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
          >
            Kitchen
          </Link>

          <Link
            href="/category/electronics"
            className="relative py-1 transition hover:text-blue-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
          >
            Electronics
          </Link>

          <Link
            href="/category/beauty"
            className="relative py-1 transition hover:text-blue-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
          >
            Beauty
          </Link>
        </div>

        {/* SEARCH */}
        <div className="hidden flex-1 items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 lg:flex">
          <Search size={18} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          {isLoggedIn ? (
            <>
              {/* CART */}
              <button
                onClick={() => router.push("/cart")}
                className="relative text-gray-700 transition hover:text-blue-600"
              >
                <ShoppingCart className="cursor-pointer" size={22} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* WISHLIST */}
              <button
                onClick={() => router.push("/wishlist")}
                className="relative text-gray-700 transition hover:text-blue-600"
              >
                <Heart className="cursor-pointer" size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* PROFILE */}
              <Link
                href="/profile"
                className="text-gray-700 transition hover:text-blue-600"
              >
                <CircleUserRound className="cursor-pointer" size={24} />
              </Link>
            </>
          ) : (
            /* LOGIN BUTTON ONLY */
            <Link
              href="/login"
              className="flex items-center gap-3 rounded-full border border-blue-600 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}