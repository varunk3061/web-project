"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        const profileResponse = await fetch(
          "http://localhost:8000/me",
          {
            method: "GET",
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

        setProfile(profileData);
        setEditName(profileData?.name || "");
        setEditMobile(profileData?.phone || "");

        if (profileData?.address) {
          setAddress(profileData.address);
        }

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

  function handleLogout() {
    localStorage.removeItem("token");

    window.dispatchEvent(new Event("cartWishlistUpdated"));

    router.push("/login");
  }

  function getInitials(name) {
    if (!name) return "U";

    const parts = name.trim().split(" ");

    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }

  function statusStyles(status) {
    const map = {
      placed: "bg-blue-100 text-blue-700",
      delivered: "bg-green-100 text-green-700",
      shipped: "bg-indigo-100 text-indigo-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
      processing: "bg-purple-100 text-purple-700",
    };

    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  }

  function startEditing() {
    setEditName(profile?.name || "");
    setEditMobile(profile?.phone || "");

    setSaveError("");
    setSaveSuccess(false);

    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setSaveError("");

    setEditName(profile?.name || "");
    setEditMobile(profile?.phone || "");
  }

  async function handleSaveDetails() {
    const token = localStorage.getItem("token");

    if (!editName.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }

    if (!editMobile) {
      setSaveError("Mobile number is required.");
      return;
    }

    if (!/^\d{10}$/.test(editMobile)) {
      setSaveError("Enter a valid 10-digit mobile number.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(
        "http://localhost:8000/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName.trim(),
            phone: editMobile.trim(),
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const profileResponse = await fetch(
        "http://localhost:8000/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to refresh profile");
      }

      const updatedProfile = await profileResponse.json();

      setProfile(updatedProfile);
      setEditName(updatedProfile?.name || "");
      setEditMobile(updatedProfile?.phone || "");
      setIsEditing(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(error);

      setSaveError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleAddressChange(e) {
    const { name, value } = e.target;

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function startAddingAddress() {
    setAddressError("");
    setAddressSuccess(false);

    setAddress({
      fullName: profile?.name || "",
      phone: profile?.phone || "",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });

    setShowAddressForm(true);
  }

  function startEditingAddress() {
    setAddressError("");
    setAddressSuccess(false);

    setAddress({
      fullName: profile?.address?.fullName || "",
      phone: profile?.address?.phone || "",
      addressLine: profile?.address?.addressLine || "",
      city: profile?.address?.city || "",
      state: profile?.address?.state || "",
      pincode: profile?.address?.pincode || "",
      country: profile?.address?.country || "India",
    });

    setShowAddressForm(true);
  }

  function cancelAddressForm() {
    setShowAddressForm(false);
    setAddressError("");
  }

  async function handleSaveAddress() {
    const token = localStorage.getItem("token");

    if (!address.fullName.trim()) {
      setAddressError("Full name is required.");
      return;
    }

    if (!/^\d{10}$/.test(address.phone)) {
      setAddressError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!address.addressLine.trim()) {
      setAddressError("Address is required.");
      return;
    }

    if (!address.city.trim()) {
      setAddressError("City is required.");
      return;
    }

    if (!address.state.trim()) {
      setAddressError("State is required.");
      return;
    }

    if (!/^\d{6}$/.test(address.pincode)) {
      setAddressError("Enter a valid 6-digit pincode.");
      return;
    }

    setAddressSaving(true);
    setAddressError("");

    try {
      const response = await fetch(
        "http://localhost:8000/me/address",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(address),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      const profileResponse = await fetch(
        "http://localhost:8000/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to refresh profile");
      }

      const updatedProfile = await profileResponse.json();

      setProfile(updatedProfile);
      setAddress(updatedProfile?.address);
      setShowAddressForm(false);
      setAddressSuccess(true);

      setTimeout(() => {
        setAddressSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(error);

      setAddressError(
        "Something went wrong. Please try again."
      );
    } finally {
      setAddressSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      {/* =========================
          PROFILE HEADER CARD
      ========================= */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="h-24 bg-linear-to-r from-blue-600 to-indigo-500" />

        <div className="px-8 pb-8">
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar + Name */}
            <div className="flex items-end gap-4">
              {/* Only the avatar pulls up into the banner — name/email stay in normal flow below it */}
              <div className="-mt-14 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-md">
                {getInitials(profile?.name)}
              </div>

              <div className="pb-1">
                <h1 className="text-2xl font-bold leading-tight text-gray-900">
                  {profile?.name}
                </h1>

                <p className="text-sm text-gray-500">
                  {profile?.email}
                </p>
              </div>
            </div>

            {/* Logout button — aligned to the same row, not floating */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex cursor-pointer items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 sm:self-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {orders.length}
              </p>

              <p className="text-xs text-gray-500">
                Total Orders
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {
                  orders.filter(
                    (o) =>
                      o.status?.toLowerCase() === "delivered"
                  ).length
                }
              </p>

              <p className="text-xs text-gray-500">
                Delivered
              </p>
            </div>

            <div className="col-span-2 rounded-xl bg-gray-50 p-4 text-center sm:col-span-1">
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {orders.reduce(
                  (sum, o) =>
                    sum + (o.totalAmount || 0),
                  0
                )}
              </p>

              <p className="text-xs text-gray-500">
                Total Spent
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          TABS
      ========================= */}
      <div className="mt-8 flex gap-2 border-b border-gray-200">
        {["orders", "details"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setIsEditing(false);
              setShowAddressForm(false);
            }}
            className={`cursor-pointer px-4 py-2.5 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab === "orders"
              ? "Order History"
              : "Account Details"}
          </button>
        ))}
      </div>

      {/* =========================
          ACCOUNT DETAILS TAB
      ========================= */}
      {activeTab === "details" && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h2>

              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit Details
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                Profile updated successfully.
              </div>
            )}

            {saveError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                {saveError}
              </div>
            )}

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm text-gray-500">
                  Full Name
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) =>
                      setEditName(e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {profile?.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500">
                  Email Address
                </label>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {profile?.email}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">
                  Mobile Number
                </label>

                {isEditing ? (
                  <input
                    type="tel"
                    value={editMobile}
                    onChange={(e) =>
                      setEditMobile(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="10-digit mobile number"
                  />
                ) : (
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {profile?.phone || (
                      <span className="text-base font-normal text-gray-400">
                        Not added
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="cursor-pointer rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveDetails}
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Delivery Address
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  This address can be used during checkout.
                </p>
              </div>

              {!showAddressForm && (
                <button
                  onClick={
                    profile?.address
                      ? startEditingAddress
                      : startAddingAddress
                  }
                  className="cursor-pointer whitespace-nowrap rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  {profile?.address
                    ? "Edit Address"
                    : "+ Add Address"}
                </button>
              )}
            </div>

            {addressSuccess && (
              <div className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                Address saved successfully.
              </div>
            )}

            {!showAddressForm && profile?.address && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="font-semibold text-gray-900">
                  {profile.address.fullName}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {profile.address.phone}
                </p>

                <p className="mt-3 text-sm text-gray-700">
                  {profile.address.addressLine}
                </p>

                <p className="mt-1 text-sm text-gray-700">
                  {profile.address.city},{" "}
                  {profile.address.state} -{" "}
                  {profile.address.pincode}
                </p>

                <p className="mt-1 text-sm text-gray-700">
                  {profile.address.country}
                </p>
              </div>
            )}

            {!showAddressForm && !profile?.address && (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <p className="font-medium text-gray-700">
                  No delivery address added
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Add your address so you can use it
                  quickly during checkout.
                </p>

                <button
                  onClick={startAddingAddress}
                  className="mt-4 cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  + Add Address
                </button>
              </div>
            )}

            {showAddressForm && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-base font-semibold text-gray-900">
                  {profile?.address
                    ? "Edit Address"
                    : "Add New Address"}
                </h3>

                {addressError && (
                  <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                    {addressError}
                  </div>
                )}

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-gray-600">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      Mobile Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={address.phone}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          phone: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-600">
                      Address
                    </label>

                    <textarea
                      name="addressLine"
                      value={address.addressLine}
                      onChange={handleAddressChange}
                      rows={3}
                      className="mt-1 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="House no, street, area"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      Pincode
                    </label>

                    <input
                      type="tel"
                      name="pincode"
                      value={address.pincode}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          pincode: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="6-digit pincode"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      Country
                    </label>

                    <input
                      type="text"
                      name="country"
                      value={address.country}
                      onChange={handleAddressChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                  <button
                    onClick={cancelAddressForm}
                    disabled={addressSaving}
                    className="cursor-pointer rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveAddress}
                    disabled={addressSaving}
                    className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addressSaving
                      ? "Saving..."
                      : "Save Address"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================
          ORDER HISTORY TAB
      ========================= */}
      {activeTab === "orders" && (
        <div className="mt-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-lg font-medium text-gray-700">
                No orders yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Your order history will show up here once
                you shop.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order.orderUuid}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs text-gray-500">
                        Order ID
                      </p>

                      <p className="font-semibold text-gray-900">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Placed on{" "}
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-100">
                    {order.items.map((item) => (
                      <div
                        key={
                          item.productUuid +
                          (item.variantUuid || "")
                        }
                        className="flex items-center justify-between gap-4 p-4"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.title}
                          </p>

                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × ₹
                            {item.price}
                          </p>
                        </div>

                        <p className="whitespace-nowrap font-semibold text-gray-900">
                          ₹
                          {item.price *
                            item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <span className="text-sm font-medium text-gray-500">
                      Order Total
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
      )}

      {/* =========================
          LOGOUT CONFIRMATION MODAL
      ========================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Are you sure you want to logout?
            </h3>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() =>
                  setShowLogoutModal(false)
                }
                className="cursor-pointer rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="cursor-pointer rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
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
