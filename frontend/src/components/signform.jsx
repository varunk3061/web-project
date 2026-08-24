"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSignup(e) {
    e.preventDefault();

    // Check whether passwords match
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    const response = await fetch("http://localhost:8000/auth/register", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      router.push("/login");
    } else {
      console.log(data);
    }
  }

  return (
    <div className="w-full max-w-md">

      <h1 className="text-4xl font-bold text-gray-900">
        Create Account
      </h1>

      <p className="mt-2 text-gray-500">
        Join us and start shopping.
      </p>

      <form
        onSubmit={handleSignup}
        className="mt-8 space-y-5"
      >

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Full Name
          </label>

          <input
            type="text"
            value={name} required
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            type="email"
            value={email} required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>

          <input
            type="password"
            value={password} required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Signup Button */}
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99]"
        >
          Create Account
        </button>

      </form>

      {/* Login Link */}
      <p className="mt-8 text-center text-gray-600">
        Already have an account?

        <Link
          href="/login"
          className="ml-2 font-semibold text-blue-600 hover:underline"
        >
          Login
        </Link>
      </p>

    </div>
  );
}
