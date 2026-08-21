"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";



export default function LoginForm() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleLogin(e) {
  e.preventDefault();
  setError("");

  const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",

    headers: {
       "Content-Type": "application/json", //{the data sending in json from}
    },

    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await response.json();

   // ❌ Login failed
    if (!response.ok) {
      setError(
        data.detail || "Invalid email or password"
      );
      return;
    }

  if (response.ok) {
  // Save JWT
  localStorage.setItem("token", data.access_token);

  // Get the newly created token
  const token = data.access_token;

  // Ask backend who is logged in
  const userResponse = await fetch(
    "http://localhost:8000/me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const userData = await userResponse.json();

  // Check the role
  if (userData.role === "admin") {
    router.push("/dashboard");
  } else {
    router.push("/");
  }
}
}
  return (
    <div className="w-full max-w-md">

      <h1 className="text-4xl font-bold text-gray-800">
        Welcome Back
      </h1>

      <p className="mt-2 text-gray-500">
        Login to continue shopping.
      </p>

      
        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

        {/* Email */}
        <div>
          <label className="mb-2 block font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block font-medium">
            Password
          </label>

          <input
           type="password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           placeholder="Enter your password"
           className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between text-sm">

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Remember Me
          </label>

          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>

        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Login
        </button>

      </form>

      {/* Divider */}
      <div className="my-8 flex items-center">

        <div className="h-px flex-1 bg-gray-300"></div>

        <span className="mx-4 text-gray-400">
          OR
        </span>

        <div className="h-px flex-1 bg-gray-300"></div>

      </div>

      {/* Signup Link */}
      <p className="text-center text-gray-600">

        Don't have an account?

        <Link
          href="/signup"
          className="ml-2 font-semibold text-blue-600 hover:underline"
        >
          Create Account
        </Link>

      </p>

    </div>
  );
}

