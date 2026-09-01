
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  MapPin,
  Pencil,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productUuid = searchParams.get("productUuid");
  const quantity = Number(searchParams.get("quantity")) || 1;

  // =========================================================
  // CART
  // =========================================================

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // =========================================================
  // ADDRESS
  // =========================================================

  const [existingAddress, setExistingAddress] = useState(null);

  const [shippingAddress, setShippingAddress] =
    useState(null);

  const [selectedAddressType, setSelectedAddressType] =
    useState("existing");

  // New address form
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Popup
  const [showAddressPopup, setShowAddressPopup] =
    useState(false);

  // =========================================================
  // SUCCESS & ERROR
  // =========================================================

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // LOAD CHECKOUT DATA
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadCheckoutData() {
      try {
        // =====================================================
        // GET USER PROFILE
        // =====================================================

        const profileResponse = await fetch(
          "http://localhost:8000/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (profileResponse.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!profileResponse.ok) {
          throw new Error("Failed to load profile");
        }

        const profileData = await profileResponse.json();

        console.log("PROFILE DATA:", profileData);
        console.log(
          "SAVED ADDRESS:",
          profileData.address
        );

        // =====================================================
        // SAVED PROFILE ADDRESS
        // =====================================================

        if (profileData.address) {
          const savedAddress = {
            fullName:
              profileData.address.fullName || "",

            phone:
              profileData.address.phone || "",

            addressLine:
              profileData.address.addressLine || "",

            city:
              profileData.address.city || "",

            state:
              profileData.address.state || "",

            pincode:
              profileData.address.pincode || "",

            country:
              profileData.address.country || "India",
          };

          setExistingAddress(savedAddress);

          // Select existing address by default
          setShippingAddress(savedAddress);

          setSelectedAddressType("existing");
        } else {
          // No existing address
          setExistingAddress(null);

          setShippingAddress(null);

          setSelectedAddressType("new");

          // Automatically open new address popup
          setShowAddressPopup(true);
        }

        // =====================================================
        // BUY NOW
        // =====================================================

        if (productUuid) {
          const response = await fetch(
            `http://localhost:8000/products/${productUuid}`
          );

          if (!response.ok) {
            setErrorMessage("Product not found");
            router.push("/");
            return;
          }

          const product = await response.json();

          setCart([
            {
              productUuid: product.productUuid,
              title: product.title,
              price: product.price,
              quantity: quantity,
            },
          ]);

          setLoading(false);
          return;
        }

        // =====================================================
        // NORMAL CART CHECKOUT
        // =====================================================

        const response = await fetch(
          "http://localhost:8000/cart",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load cart");
        }

        const data = await response.json();

        setCart(data.items || []);

        setLoading(false);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error.message ||
            "Something went wrong loading checkout."
        );

        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [router, productUuid, quantity]);

  // =========================================================
  // TOTAL PRICE
  // =========================================================

  const totalPrice = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  // =========================================================
  // SELECT EXISTING ADDRESS
  // =========================================================

  function selectExistingAddress() {
    if (!existingAddress) {
      setErrorMessage(
        "You don't have a saved address. Please enter a new address."
      );

      return;
    }

    setShippingAddress(existingAddress);

    setSelectedAddressType("existing");

    setErrorMessage("");
  }

  // =========================================================
  // OPEN NEW ADDRESS POPUP
  // =========================================================

  function openNewAddressPopup() {
    setErrorMessage("");

    // If a new address is already selected,
    // open it for editing.
    if (
      shippingAddress &&
      selectedAddressType === "new"
    ) {
      setNewAddress({
        fullName:
          shippingAddress.fullName || "",

        phone:
          shippingAddress.phone || "",

        addressLine:
          shippingAddress.addressLine || "",

        city:
          shippingAddress.city || "",

        state:
          shippingAddress.state || "",

        pincode:
          shippingAddress.pincode || "",

        country:
          shippingAddress.country || "India",
      });
    } else {
      // Empty form
      setNewAddress({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      });
    }

    setShowAddressPopup(true);
  }

  // =========================================================
  // CLOSE POPUP
  // =========================================================

  function closeAddressPopup() {
    setShowAddressPopup(false);

    setErrorMessage("");
  }

  // =========================================================
  // NEW ADDRESS FORM CHANGE
  // =========================================================

  function handleNewAddressChange(e) {
    const { name, value } = e.target;

    setNewAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =========================================================
  // USE NEW ADDRESS
  // =========================================================

  function useNewAddress() {
    setErrorMessage("");

    // Required fields
    if (
      !newAddress.fullName.trim() ||
      !newAddress.phone.trim() ||
      !newAddress.addressLine.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim() ||
      !newAddress.pincode.trim()
    ) {
      setErrorMessage(
        "Please fill in all required address fields."
      );

      return;
    }

    // Phone validation
    if (!/^\d{10}$/.test(newAddress.phone)) {
      setErrorMessage(
        "Invalid phone number. Please enter a valid 10-digit phone number."
      );

      return;
    }

    // Pincode validation
    if (!/^[1-9][0-9]{5}$/.test(newAddress.pincode)) {
      setErrorMessage(
        "Invalid pincode. Please enter a valid 6-digit pincode."
      );

      return;
    }

    // =====================================================
    // SELECT NEW ADDRESS
    // =====================================================

    setShippingAddress({
      ...newAddress,
    });

    setSelectedAddressType("new");

    setShowAddressPopup(false);

    setErrorMessage("");
  }

  // =========================================================
  // PLACE ORDER
  // =========================================================

  async function placeOrder() {
    setErrorMessage("");

    // =====================================================
    // CART CHECK
    // =====================================================

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    // =====================================================
    // ADDRESS CHECK
    // =====================================================

    if (!shippingAddress) {
      setErrorMessage(
        "Please select a delivery address."
      );

      return;
    }

    // =====================================================
    // FRONTEND ADDRESS VALIDATION
    // =====================================================

    if (
      !shippingAddress.fullName ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      setErrorMessage(
        "Please provide the complete delivery address."
      );

      return;
    }

    // =====================================================
    // PINCODE VALIDATION
    // =====================================================

    if (
      !/^[1-9][0-9]{5}$/.test(
        shippingAddress.pincode
      )
    ) {
      setErrorMessage(
        "Invalid pincode. Please enter a valid 6-digit pincode."
      );

      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    // =====================================================
    // IMPORTANT
    //
    // PROFILE ADDRESS:
    //
    // addressLine
    //
    // ORDER SCHEMA:
    //
    // line1
    //
    // Therefore convert addressLine -> line1
    // before sending to /orders.
    // =====================================================

    const orderShippingAddress = {
      fullName: shippingAddress.fullName,

      line1: shippingAddress.addressLine,

      // Your OrderCreate schema supports line2.
      // We don't have line2 in the profile address,
      // so send an empty string.
      line2: "",

      city: shippingAddress.city,

      state: shippingAddress.state,

      pincode: shippingAddress.pincode,
    };

    console.log(
      "ORDER SHIPPING ADDRESS:",
      orderShippingAddress
    );

    // =====================================================
    // CREATE ORDER
    // =====================================================

    try {
      setPlacingOrder(true);

      const response = await fetch(
        "http://localhost:8000/orders",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            shippingAddress:
              orderShippingAddress,

            ...(productUuid && {
              productUuid: productUuid,
              quantity: quantity,
            }),
          }),
        }
      );

      const data = await response.json();

      console.log("ORDER RESPONSE:", data);

      // =====================================================
      // HANDLE FASTAPI 422
      // =====================================================

      if (!response.ok) {
        let message =
          "Failed to place order";

        if (Array.isArray(data.detail)) {
          message = data.detail
            .map((error) => {
              const field =
                Array.isArray(error.loc)
                  ? error.loc.join(" → ")
                  : "";

              return `${field}: ${error.msg}`;
            })
            .join("\n");
        } else if (
          typeof data.detail === "string"
        ) {
          message = data.detail;
        } else if (
          typeof data.message === "string"
        ) {
          message = data.message;
        }

        throw new Error(message);
      }

      // =====================================================
      // NOTIFY NAVBAR
      // =====================================================

      window.dispatchEvent(
        new Event("cartWishlistUpdated")
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      setPlacedOrderId(
        data.orderUuid ||
          data.id ||
          null
      );

      setOrderSuccess(true);
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Something went wrong placing the order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-500">
            Loading checkout...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN CHECKOUT
  // =========================================================

  return (
    <div className="relative min-h-screen bg-gray-50/60 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto w-full max-w-6xl">

        {/* =================================================
            TITLE
        ================================================= */}

        <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
          Checkout
        </h1>

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage &&
          !showAddressPopup && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">

              <div className="flex items-center gap-2">

                <AlertCircle
                  size={18}
                  className="shrink-0"
                />

                <span className="whitespace-pre-line">
                  {errorMessage}
                </span>

              </div>

              <button
                onClick={() =>
                  setErrorMessage("")
                }
                className="cursor-pointer"
              >
                <X size={16} />
              </button>

            </div>
          )}

        <div className="grid gap-8 md:grid-cols-2">

          {/* =================================================
              DELIVERY ADDRESS
          ================================================= */}

          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Address
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Choose where you want your order delivered
                </p>

              </div>

              <MapPin
                size={22}
                className="text-blue-600"
              />

            </div>

            {/* =================================================
                EXISTING ADDRESS
            ================================================= */}

            <div
              onClick={
                selectExistingAddress
              }
              className={`mt-6 rounded-2xl border-2 p-5 transition ${
                existingAddress
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-60"
              } ${
                selectedAddressType ===
                "existing"
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >

              <div className="flex items-start gap-3">

                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selectedAddressType ===
                    "existing"
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >

                  {selectedAddressType ===
                    "existing" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between">

                    <p className="font-bold text-gray-900">
                      Use Existing Address
                    </p>

                    {selectedAddressType ===
                      "existing" && (
                      <CheckCircle2
                        size={19}
                        className="text-blue-600"
                      />
                    )}

                  </div>

                  {existingAddress ? (
                    <div className="mt-3 text-sm leading-6 text-gray-600">

                      <p className="font-semibold text-gray-900">
                        {
                          existingAddress.fullName
                        }
                      </p>

                      {existingAddress.phone && (
                        <p>
                          Phone:{" "}
                          {
                            existingAddress.phone
                          }
                        </p>
                      )}

                      <p>
                        {
                          existingAddress.addressLine
                        }
                      </p>

                      <p>
                        {
                          existingAddress.city
                        }
                        ,{" "}
                        {
                          existingAddress.state
                        }
                      </p>

                      <p>
                        {
                          existingAddress.country
                        }{" "}
                        -{" "}
                        {
                          existingAddress.pincode
                        }
                      </p>

                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      No saved address available.
                    </p>
                  )}

                </div>

              </div>

            </div>

            {/* =================================================
                NEW ADDRESS OPTION
            ================================================= */}

            <div
              onClick={
                openNewAddressPopup
              }
              className={`mt-4 cursor-pointer rounded-2xl border-2 p-5 transition ${
                selectedAddressType ===
                "new"
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selectedAddressType ===
                    "new"
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >

                  {selectedAddressType ===
                    "new" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  )}

                </div>

                <div className="flex-1">

                  <p className="font-bold text-gray-900">
                    Enter New Address
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Deliver this order to a different address
                  </p>

                </div>

                <Pencil
                  size={18}
                  className="text-blue-600"
                />

              </div>

            </div>

            {/* =================================================
                NEW SELECTED ADDRESS
            ================================================= */}

            {shippingAddress &&
              selectedAddressType ===
                "new" && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                  <div className="flex items-center justify-between">

                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      New Address Selected
                    </p>

                    <CheckCircle2
                      size={17}
                      className="text-emerald-600"
                    />

                  </div>

                  <div className="mt-2 text-sm leading-6 text-gray-700">

                    <p className="font-semibold">
                      {
                        shippingAddress.fullName
                      }
                    </p>

                    <p>
                      Phone:{" "}
                      {
                        shippingAddress.phone
                      }
                    </p>

                    <p>
                      {
                        shippingAddress.addressLine
                      }
                    </p>

                    <p>
                      {
                        shippingAddress.city
                      }
                      ,{" "}
                      {
                        shippingAddress.state
                      }
                    </p>

                    <p className="font-semibold">
                      {
                        shippingAddress.country
                      }{" "}
                      -{" "}
                      {
                        shippingAddress.pincode
                      }
                    </p>

                  </div>

                  <button
                    onClick={
                      openNewAddressPopup
                    }
                    className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Pencil size={14} />
                    Edit New Address
                  </button>

                </div>
              )}

          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">

            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Review your items and total price
            </p>

            <div className="mt-6 divide-y divide-gray-100">

              {cart.map((item) => (
                <div
                  key={`${item.productUuid}-${
                    item.variantUuid || ""
                  }`}
                  className="flex items-center justify-between py-3"
                >

                  <div className="pr-4">

                    <p className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Qty:{" "}
                      {item.quantity}
                    </p>

                  </div>

                  <p className="shrink-0 text-sm font-bold text-gray-900">
                    ₹
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>
              ))}

            </div>

            {/* =================================================
                PRICE
            ================================================= */}

            <div className="my-6 space-y-2 border-t border-gray-100 pt-4 text-sm">

              <div className="flex justify-between text-gray-600">

                <span>
                  Delivery Charges
                </span>

                <span className="font-semibold text-emerald-600">
                  FREE
                </span>

              </div>

              <div className="flex justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-900">

                <span>
                  Total Amount
                </span>

                <span className="text-blue-600">
                  ₹
                  {totalPrice.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

            </div>

            {/* =================================================
                PLACE ORDER
            ================================================= */}

            <button
              onClick={placeOrder}
              disabled={
                placingOrder ||
                !shippingAddress
              }
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {placingOrder ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  <span>
                    Placing Order...
                  </span>
                </>
              ) : (
                <span>
                  Place Order
                </span>
              )}

            </button>

          </div>

        </div>
      </div>

      {/* =========================================================
          NEW ADDRESS POPUP
      ========================================================= */}

      {showAddressPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-gray-100 p-6">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Enter New Delivery Address
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Enter the address for this order
                </p>

              </div>

              <button
                onClick={
                  closeAddressPopup
                }
                className="cursor-pointer rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={20} />
              </button>

            </div>

            {/* =================================================
                POPUP ERROR
            ================================================= */}

            {errorMessage && (
              <div className="mx-6 mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span className="whitespace-pre-line">
                  {errorMessage}
                </span>

              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <div className="space-y-4 p-6">

              {/* Full Name */}

              <div>

                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={
                    newAddress.fullName
                  }
                  onChange={
                    handleNewAddressChange
                  }
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Phone */}

              <div>

                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Phone *
                </label>

                <input
                  type="text"
                  name="phone"
                  placeholder="10-digit phone number"
                  maxLength={10}
                  value={
                    newAddress.phone
                  }
                  onChange={
                    handleNewAddressChange
                  }
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Address */}

              <div>

                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Address *
                </label>

                <input
                  type="text"
                  name="addressLine"
                  placeholder="House / Flat No., Street, Area"
                  value={
                    newAddress.addressLine
                  }
                  onChange={
                    handleNewAddressChange
                  }
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* City & State */}

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={
                      newAddress.city
                    }
                    onChange={
                      handleNewAddressChange
                    }
                    className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div>

                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    State *
                  </label>

                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={
                      newAddress.state
                    }
                    onChange={
                      handleNewAddressChange
                    }
                    className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* Pincode */}

              <div>

                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Pincode *
                </label>

                <input
                  type="text"
                  name="pincode"
                  placeholder="6-digit Pincode"
                  maxLength={6}
                  value={
                    newAddress.pincode
                  }
                  onChange={
                    handleNewAddressChange
                  }
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Country */}

              <div>

                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={
                    newAddress.country
                  }
                  onChange={
                    handleNewAddressChange
                  }
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* =================================================
                POPUP BUTTONS
            ================================================= */}

            <div className="flex gap-3 border-t border-gray-100 p-6">

              <button
                onClick={
                  closeAddressPopup
                }
                className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={useNewAddress}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <MapPin size={17} />
                Use This Address
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          ORDER SUCCESS POPUP
      ========================================================= */}

      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">

          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl animate-in zoom-in-95">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

              <CheckCircle2
                size={48}
                className="animate-pulse"
              />

            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-gray-900">
              Order Placed Successfully!
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Thank you for shopping with us!
              Your order has been placed and is
              currently being processed.
            </p>

            {placedOrderId && (
              <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">

                <span className="text-gray-400">
                  Order ID:{" "}
                </span>

                <span className="font-mono font-bold text-gray-800">
                  #{placedOrderId}
                </span>

              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">

              <button
                onClick={() =>
                  router.push("/orders")
                }
                className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
              >
                View My Orders
              </button>

              <button
                onClick={() =>
                  router.push("/")
                }
                className="w-full cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-98"
              >
                Continue Shopping
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

