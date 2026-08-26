"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {Search,Plus,Edit2,Trash2,X,Package,AlertCircle,Check,} from "lucide-react";

export default function ProductsPage() {
const capitalizeWords = (value) => {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    categoryUuid: "",
    brand: "",
    imageUrls: "",
    stock: "",
    variants: [],
  });

  const emptyForm = {
    title: "",
    description: "",
    price: "",
    categoryUuid: "",
    brand: "",
    imageUrls: "",
    stock: "",
    variants: [],
  };

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8000/products");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // FETCH CATEGORIES
  // =========================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/admin/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // =========================
  // FILTERED PRODUCTS BY NAME
  // =========================
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((product) =>
      product.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [products, searchQuery]);

  // =========================
  // CREATE / EDIT PRODUCT
  // =========================
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      variants: formData.variants.map((variant) => ({
        ...variant,
        price: Number(variant.price),
        stock: Number(variant.stock),
      })),
    };

    try {
      const url = editingProduct
        ? `http://localhost:8000/admin/products/${editingProduct.productUuid}`
        : "http://localhost:8000/admin/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Failed to save product");
        return;
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/admin/products/${productToDelete.productUuid}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Failed to delete product");
        return;
      }

      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Something went wrong deleting product");
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================
  // VARIANT HANDLERS
  // =========================
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          variantUuid: null,
          attributes: { option: "" },
          price: "",
          stock: "",
        },
      ],
    });
  };

  const removeVariant = (index) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: updatedVariants });
  };

  const updateVariantAttribute = (variantIndex, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].attributes.option = value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  const updateVariant = (variantIndex, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex][field] = value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  // =========================
  // MODAL CONTROLS
  // =========================
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      categoryUuid: product.categoryUuid || "",
      brand: product.brand || "",
      imageUrls: product.imageUrls || "",
      stock: product.stock || "",
      variants: product.variants || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(emptyForm);
  };

  const inputStyles =
    "w-full rounded-xl border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Products
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage inventory, prices, variants, and product catalog.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>

        {/* ================= SEARCH BAR (NAME ONLY) ================= */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-xs">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search product by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          <span className="shrink-0 text-xs font-semibold text-gray-500 pr-2">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "Product" : "Products"}
          </span>
        </div>

        {/* ================= PRODUCTS TABLE ================= */}
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Brand</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <Package size={24} />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-gray-900">
                        No products found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {searchQuery
                          ? `No product matches "${searchQuery}".`
                          : "Click '+ Add Product' to create your first product."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.productUuid}
                      className="transition hover:bg-gray-50/80"
                    >
                      {/* Product Name & Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200/70 bg-gray-50">
                            {product.imageUrls ? (
                              <Image
                                src={product.imageUrls}
                                alt={product.title}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <Package size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">
                              {product.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {product.variants?.length || 0} variants
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">
                        {product.brand || "—"}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        {product.stock > 0 ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {product.stock} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            Out of stock
                          </span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                        ⭐ {product.rating || "4.5"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-2xs transition hover:bg-blue-50 active:scale-95"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setProductToDelete(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs transition hover:bg-rose-50 active:scale-95"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🚀 ADD / EDIT PRODUCT POPUP MODAL                          */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple iPhone 15"
                    value={formData.title}
                  onChange={(e) =>
                        setFormData({
                          ...formData,
                          title: capitalizeWords(e.target.value),
                        })
                      }
                    className={inputStyles}
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apple"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryUuid}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryUuid: e.target.value })
                    }
                    className={inputStyles}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option
                        key={category.categoryUuid}
                        value={category.categoryUuid}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 79999"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.imageUrls}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrls: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Write a brief overview of the product..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>
              </div>

              {/* ================= VARIANTS SECTION ================= */}
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Product Variants
                    </h3>
                    <p className="text-xs text-gray-500">
                      Optional variant options like sizes, RAM, or storage.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <Plus size={14} />
                    <span>Add Variant</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.variants.map((variant, index) => (
                    <div
                      key={variant.variantUuid || index}
                      className="rounded-2xl border border-gray-200/80 bg-gray-50/70 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">
                          Variant #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <input
                          type="text"
                          placeholder="Option (e.g. 256GB)"
                          value={variant.attributes?.option || ""}
                          onChange={(e) =>
                            updateVariantAttribute(index, e.target.value)
                          }
                          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(index, "price", e.target.value)
                          }
                          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(index, "stock", e.target.value)
                          }
                          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-98"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ⚠️ DELETE CONFIRMATION POPUP MODAL                         */}
      {/* ========================================================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 size={24} />
            </div>

            <h3 className="mt-4 text-base font-bold text-gray-900">
              Delete Product?
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                "{productToDelete.title}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-98 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}