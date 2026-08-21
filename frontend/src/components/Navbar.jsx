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

   useEffect(() => {

    const token = localStorage.getItem("token");

    setIsLoggedIn(!!token);  //if no token then false and if token then true

  }, []);


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

    if (!token) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    try {

      // -------------------------
      // CART
      // -------------------------

      const cartResponse = await fetch(
        "http://localhost:8000/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

        setWishlistCount(
          wishlistData.items.length
        );

      }

    } catch (error) {

      console.error(
        "Failed to load counts:",
        error
      );

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

    window.addEventListener(
      "cartWishlistUpdated",
      loadCounts
    );

    return () => {

      window.removeEventListener(  //crateing the browser event it tells Hey! Something changed in the cart or wishlist.
        "cartWishlistUpdated",
        loadCounts
      );

    };

  }, []);


  return (

    <nav className="sticky top-0 z-50 bg-white shadow-sm">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* LOGO */}

        <Link
          href="/"
          className="text-2xl font-bold tracking-wide text-blue-600"
        >

          <Image
            src="/aurabazar.png"
            alt="Flipkart Logo"
            width={150}
            height={80}
            className="object-contain"
            priority
          />

        </Link>


        {/* NAVIGATION */}

        <div className="hidden gap-8 font-medium md:flex">

          <Link href="/category/clothes">
            Fashion
          </Link>

          <Link href="/category/kitchen">
            Kitchen
          </Link>

          <Link href="/category/electronics">
            Electronics
          </Link>

          <Link href="/category/beauty">
            Beauty
          </Link>

        </div>


        {/* SEARCH */}

        <div className="hidden items-center rounded-lg border px-3 py-2 lg:flex">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="ml-2 w-64 outline-none"
          />

        </div>


        {/* RIGHT SIDE */}

        <div className="flex items-center gap-4">

          {/* LOGIN */}

          {!isLoggedIn && (
            <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-md border border-blue-600 px-5 py-2 font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
                >
                  Login
            </Link>
          )}


         {/* CART */}

            <button
              onClick={() => {
                if (!isLoggedIn) {
                  router.push("/login");
                  return;
                }

                router.push("/cart");
              }}
              className="relative"
            >
              <ShoppingCart className="cursor-pointer" />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>


          {/* WISHLIST */}

                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      router.push("/login");
                      return;
                    }

                    router.push("/wishlist");
                  }}
                  className="relative"
                >
                  <Heart className="cursor-pointer" />

                  {wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>


          {/* PROFILE */}

          <Link href="/profile">

            <CircleUserRound className="cursor-pointer" />

          </Link>

        </div>

      </div>

    </nav>

  );

}