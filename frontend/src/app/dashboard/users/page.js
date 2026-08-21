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
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Users
      </h1>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Created Date</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.userUuid} className="border-b">
                <td className="px-6 py-4">
                  {user.name}
                </td>

                <td className="px-6 py-4">
                  {user.email}
                </td>

                <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                </td>

                <td className="px-6 py-4">
                  {new Date(user.createdAt).toLocaleDateString()}   {/*use to convert into readable format*/}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}