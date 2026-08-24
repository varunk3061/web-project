"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setUsers(data);
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Users
          </h1>

          <p className="mt-1 text-gray-500">
            Everyone with an account on your store
          </p>
        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          {users.length} {users.length === 1 ? "User" : "Users"}
        </div>

      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        <div className="overflow-x-auto">

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created Date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-14 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {users.map((user) => (
              <tr key={user.userUuid} className="transition hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <span className="text-sm font-medium text-gray-900">
                      {user.name}
                    </span>

                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>

                <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}   {/*use to convert into readable format*/}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        </div>

      </div>
    </div>
  );
}
