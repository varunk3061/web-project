"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const [editingCategory, setEditingCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // -------------------------
  // GET CATEGORIES
  // -------------------------
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      setCategories(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // -------------------------
  // ADD CATEGORY
  // -------------------------
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/admin/categories`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      setName("");

      await fetchCategories();
    } catch (error) {
      console.error(error);
      setError("Unable to create category.");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // DELETE CATEGORY
  // -------------------------
  const handleDelete = async (categoryUuid) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/admin/categories/${categoryUuid}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      await fetchCategories();
    } catch (error) {
      console.error(error);
      setError("Unable to delete category.");
    }
  };

  // -------------------------
  // EDIT CATEGORY
  // -------------------------
  const handleEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setError("");
  };

  // -------------------------
  // UPDATE CATEGORY
  // -------------------------
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/admin/categories/${editingCategory.categoryUuid}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      setEditingCategory(null);
      setName("");

      await fetchCategories();
    } catch (error) {
      console.error(error);
      setError("Unable to update category.");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // CANCEL EDIT
  // -------------------------
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Categories
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your product categories
          </p>
        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          {categories.length} {categories.length === 1 ? "Category" : "Categories"}
        </div>

      </div>

      {/* Add / Edit Form */}
      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-2">

          {editingCategory ? (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Pencil size={18} className="text-blue-600" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                Edit Category
              </h2>
            </>
          ) : (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Plus size={18} className="text-blue-600" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                Add Category
              </h2>
            </>
          )}

        </div>

        <form
          onSubmit={
            editingCategory
              ? handleUpdate
              : handleAddCategory
          }
          className="flex flex-col gap-4 md:flex-row"
        >

          <input
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingCategory
              ? "Update"
              : "Add Category"}
          </button>

          {editingCategory && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-600 transition hover:bg-gray-100"
            >
              <X size={18} />
              Cancel
            </button>
          )}

        </form>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-6 py-5">

          <h2 className="font-semibold text-gray-900">
            All Categories
          </h2>

        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 p-14 text-center text-gray-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-14 text-center text-gray-500">
            No categories found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created At
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {categories.map((category) => (

                  <tr
                    key={category.categoryUuid}
                    className="transition hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">

                      <div className="font-medium text-gray-900">
                        {category.name}
                      </div>

                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">

                      {category.createdAt
                        ? new Date(
                            category.createdAt
                          ).toLocaleDateString()
                        : "-"}

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            handleEdit(category)
                          }
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              category.categoryUuid
                            )
                          }
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}
