"use client";

import React, { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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

  // =========================
  // FETCH PRODUCTS
  // =========================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/products"
        );

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  // =========================
  // FETCH CATEGORIES
  // =========================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8000/admin/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, []);

  // =========================
  // EMPTY FORM
  // =========================

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
  // CREATE PRODUCT
  // =========================

  const handleCreateProduct = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8000/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,

            price: Number(formData.price),

            stock: Number(formData.stock),

            variants: formData.variants.map((variant) => ({
              ...variant,

              price: Number(variant.price),

              stock: Number(variant.stock),
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail || "Failed to create product"
        );
        return;
      }

      alert("Product created successfully");

      setShowForm(false);
      setEditingProduct(null);

      setFormData(emptyForm);

      // Refresh products

      const productsResponse = await fetch(
        "http://localhost:8000/products"
      );

      const productsData =
        await productsResponse.json();

      setProducts(productsData);
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }
  };

  // =========================
  // UPDATE PRODUCT
  // =========================

  const handleEditProduct = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8000/admin/products/${editingProduct.productUuid}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            ...formData,

            price: Number(formData.price),

            stock: Number(formData.stock),

            variants: formData.variants.map(
              (variant) => ({
                ...variant,

                price: Number(variant.price),

                stock: Number(variant.stock),
              })
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data);

        alert(
          data.detail ||
            "Failed to update product"
        );

        return;
      }

      alert("Product updated successfully");

      setShowForm(false);

      setEditingProduct(null);

      setFormData(emptyForm);

      // Refresh products

      const productsResponse = await fetch(
        "http://localhost:8000/products"
      );

      const productsData =
        await productsResponse.json();

      setProducts(productsData);
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDeleteProduct = async (
    productUuid
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8000/admin/products/${productUuid}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data);

        alert(
          data.detail ||
            "Failed to delete product"
        );

        return;
      }

      alert("Product deleted successfully");

      // Refresh products

      const productsResponse = await fetch(
        "http://localhost:8000/products"
      );

      const productsData =
        await productsResponse.json();

      setProducts(productsData);
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }
  };

  // =========================
  // ADD VARIANT
  // =========================

  const addVariant = () => {
    setFormData({
      ...formData,

      variants: [
        ...formData.variants,

        {
          variantUuid: null,

          attributes: {
            option: "",
          },

          price: "",

          stock: "",
        },
      ],
    });
  };

  // =========================
  // REMOVE VARIANT
  // =========================

  const removeVariant = (index) => {
    const updatedVariants =
      formData.variants.filter(
        (_, i) => i !== index
      );

    setFormData({
      ...formData,

      variants: updatedVariants,
    });
  };

  // =========================
  // UPDATE VARIANT ATTRIBUTE
  // =========================

  const updateVariantAttribute = (
    variantIndex,
    value
  ) => {
    const updatedVariants = [
      ...formData.variants,
    ];

    updatedVariants[
      variantIndex
    ].attributes.option = value;

    setFormData({
      ...formData,

      variants: updatedVariants,
    });
  };

  // =========================
  // UPDATE VARIANT FIELD
  // =========================

  const updateVariant = (
    variantIndex,
    field,
    value
  ) => {
    const updatedVariants = [
      ...formData.variants,
    ];

    updatedVariants[variantIndex][field] =
      value;

    setFormData({
      ...formData,

      variants: updatedVariants,
    });
  };

  // =========================
  // START EDITING
  // =========================

  const startEditing = (product) => {
    setEditingProduct(product);

    setFormData({
      title: product.title || "",

      description:
        product.description || "",

      price: product.price || "",

      categoryUuid:
        product.categoryUuid || "",

      brand: product.brand || "",

      imageUrls:
        product.imageUrls || "",

      stock: product.stock || "",

      variants: product.variants || [],
    });

    setShowForm(true);
  };

  // =========================
  // START ADD PRODUCT
  // =========================

  const startAddingProduct = () => {
    setEditingProduct(null);

    setFormData(emptyForm);

    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    setShowForm(false);

    setEditingProduct(null);

    setFormData(emptyForm);
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="p-6">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Products
          </h1>

          <p className="text-gray-500">
            Manage your products
          </p>
        </div>

        <button
          onClick={startAddingProduct}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          + Add Product
        </button>

      </div>


      {/* =========================
          ADD PRODUCT FORM
          ONLY SHOW AT TOP WHEN
          CREATING NEW PRODUCT
      ========================== */}

      {showForm && !editingProduct && (

        <div className="mb-6 rounded-lg border bg-white p-6">

          <h2 className="mb-4 text-xl font-semibold">
            Add Product
          </h2>

          <div className="grid grid-cols-2 gap-4">

            {/* TITLE */}

            <input
              type="text"
              placeholder="Product title"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  title: e.target.value,
                })
              }
              className="rounded-lg border px-3 py-2"
            />


            {/* BRAND */}

            <input
              type="text"
              placeholder="Brand"
              value={formData.brand}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  brand: e.target.value,
                })
              }
              className="rounded-lg border px-3 py-2"
            />


            {/* PRICE */}

            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  price: e.target.value,
                })
              }
              className="rounded-lg border px-3 py-2"
            />


            {/* STOCK */}

            <input
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  stock: e.target.value,
                })
              }
              className="rounded-lg border px-3 py-2"
            />


            {/* CATEGORY */}

            <select
              value={formData.categoryUuid}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  categoryUuid:
                    e.target.value,
                })
              }
              className="rounded-lg border px-3 py-2"
            >

              <option value="">
                Select Category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.categoryUuid
                    }
                    value={
                      category.categoryUuid
                    }
                  >
                    {category.name}
                  </option>
                )
              )}

            </select>


            {/* IMAGE */}

            <input
              type="text"
              placeholder="Image URL"
              value={formData.imageUrls}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  imageUrls:
                    e.target.value,
                })
              }
              className="rounded-lg border px-3 py-2"
            />


            {/* DESCRIPTION */}

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  description:
                    e.target.value,
                })
              }
              className="col-span-2 rounded-lg border px-3 py-2"
            />


            {/* =========================
                VARIANTS
            ========================== */}

            <div className="col-span-2">

              <div className="mb-3 flex items-center justify-between">

                <h3 className="text-lg font-semibold">
                  Product Variants
                </h3>

                <button
                  type="button"
                  onClick={addVariant}
                  className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                >
                  + Add Variant
                </button>

              </div>


              {formData.variants.map(
                (variant, index) => (

                  <div
                    key={
                      variant.variantUuid ||
                      index
                    }
                    className="mb-4 rounded-lg border bg-gray-50 p-4"
                  >

                    <div className="mb-3 flex items-center justify-between">

                      <h4 className="font-medium">
                        Variant {index + 1}
                      </h4>

                      <button
                        type="button"
                        onClick={() =>
                          removeVariant(index)
                        }
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>

                    </div>


                    <div className="grid grid-cols-3 gap-3">

                      {/* ATTRIBUTE */}

                      <input
                        type="text"
                        placeholder="Variant option e.g. 128GB"
                        value={
                          variant
                            .attributes
                            ?.option || ""
                        }
                        onChange={(e) =>
                          updateVariantAttribute(
                            index,
                            e.target.value
                          )
                        }
                        className="rounded-lg border px-3 py-2"
                      />


                      {/* VARIANT PRICE */}

                      <input
                        type="number"
                        placeholder="Variant Price"
                        value={
                          variant.price
                        }
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "price",
                            e.target.value
                          )
                        }
                        className="rounded-lg border px-3 py-2"
                      />


                      {/* VARIANT STOCK */}

                      <input
                        type="number"
                        placeholder="Variant Stock"
                        value={
                          variant.stock
                        }
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "stock",
                            e.target.value
                          )
                        }
                        className="rounded-lg border px-3 py-2"
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* BUTTONS */}

          <div className="mt-4 flex gap-3">

            <button
              onClick={
                handleCreateProduct
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create Product
            </button>

            <button
              onClick={closeForm}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            </button>

          </div>

        </div>

      )}


      {/* =========================
          PRODUCT TABLE
      ========================== */}

      <div className="overflow-hidden rounded-lg border bg-white">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-4 py-3 text-left">
                Product
              </th>

              <th className="px-4 py-3 text-left">
                Brand
              </th>

              <th className="px-4 py-3 text-left">
                Price
              </th>

              <th className="px-4 py-3 text-left">
                Stock
              </th>

              <th className="px-4 py-3 text-left">
                Rating
              </th>

              <th className="px-4 py-3 text-left">
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {products.map(
              (product) => (

                <React.Fragment
                  key={
                    product.productUuid
                  }
                >

                  {/* PRODUCT ROW */}

                  <tr className="border-t">

                    <td className="px-4 py-4 font-medium">
                      {product.title}
                    </td>

                    <td className="px-4 py-4">
                      {product.brand}
                    </td>

                    <td className="px-4 py-4">
                      ₹{product.price}
                    </td>

                    <td className="px-4 py-4">
                      {product.stock}
                    </td>

                    <td className="px-4 py-4">
                      ⭐ {product.rating}
                    </td>

                    <td className="px-4 py-4">

                      <button
                        onClick={() =>
                          startEditing(
                            product
                          )
                        }
                        className="mr-2 text-blue-600"
                      >
                        Edit
                      </button>


                      <button
                        onClick={() =>
                          handleDeleteProduct(
                            product.productUuid
                          )
                        }
                        className="text-red-600"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>


                  {/* =========================
                      EDIT FORM
                      APPEARS UNDER SELECTED
                      PRODUCT
                  ========================== */}

                  {showForm &&
                    editingProduct?.productUuid ===
                      product.productUuid && (

                      <tr>

                        <td
                          colSpan={6}
                          className="bg-gray-50 p-6"
                        >

                          <div className="rounded-lg border bg-white p-6">

                            <div className="mb-4 flex items-center justify-between">

                              <h2 className="text-xl font-semibold">
                                Edit Product
                              </h2>

                              <button
                                onClick={
                                  closeForm
                                }
                                className="text-gray-500 hover:text-black"
                              >
                                ✕
                              </button>

                            </div>


                            <div className="grid grid-cols-2 gap-4">

                              {/* TITLE */}

                              <input
                                type="text"
                                placeholder="Product title"
                                value={
                                  formData.title
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,

                                    title:
                                      e.target
                                        .value,
                                  })
                                }
                                className="rounded-lg border px-3 py-2"
                              />


                              {/* BRAND */}

                              <input
                                type="text"
                                placeholder="Brand"
                                value={
                                  formData.brand
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,

                                    brand:
                                      e.target
                                        .value,
                                  })
                                }
                                className="rounded-lg border px-3 py-2"
                              />


                              {/* PRICE */}

                              <input
                                type="number"
                                placeholder="Price"
                                value={
                                  formData.price
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,

                                    price:
                                      e.target
                                        .value,
                                  })
                                }
                                className="rounded-lg border px-3 py-2"
                              />


                              {/* STOCK */}

                              <input
                                type="number"
                                placeholder="Stock"
                                value={
                                  formData.stock
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,

                                    stock:
                                      e.target
                                        .value,
                                  })
                                }
                                className="rounded-lg border px-3 py-2"
                              />


                              {/* CATEGORY */}

                              <select
                                value={
                                  formData.categoryUuid
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,

                                    categoryUuid:
                                      e.target
                                        .value,
                                  })
                                }
                                className="rounded-lg border px-3 py-2"
                              >

                                <option value="">
                                  Select Category
                                </option>

                                {categories.map(
                                  (
                                    category
                                  ) => (

                                    <option
                                      key={
                                        category.categoryUuid
                                      }
                                      value={
                                        category.categoryUuid
                                      }
                                    >
                                      {
                                        category.name
                                      }
                                    </option>

                                  )
                                )}

                              </select>


                              {/* IMAGE */}

                              <input
                                type="text"
                                placeholder="Image URL"
                                value={
                                  formData.imageUrls
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,

                                    imageUrls:
                                      e.target
                                        .value,
                                  })
                                }
                                className="rounded-lg border px-3 py-2"
                              />


                              {/* DESCRIPTION */}

                              <textarea
                                placeholder="Description"
                                value={
                                  formData.description
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,

                                    description:
                                      e.target
                                        .value,
                                  })
                                }
                                className="col-span-2 rounded-lg border px-3 py-2"
                              />


                              {/* =========================
                                  VARIANTS
                              ========================== */}

                              <div className="col-span-2">

                                <div className="mb-3 flex items-center justify-between">

                                  <h3 className="text-lg font-semibold">
                                    Product Variants
                                  </h3>

                                  <button
                                    type="button"
                                    onClick={
                                      addVariant
                                    }
                                    className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                                  >
                                    + Add Variant
                                  </button>

                                </div>


                                {formData.variants.map(
                                  (
                                    variant,
                                    index
                                  ) => (

                                    <div
                                      key={
                                        variant.variantUuid ||
                                        index
                                      }
                                      className="mb-4 rounded-lg border bg-gray-50 p-4"
                                    >

                                      <div className="mb-3 flex items-center justify-between">

                                        <h4 className="font-medium">
                                          Variant{" "}
                                          {index +
                                            1}
                                        </h4>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeVariant(
                                              index
                                            )
                                          }
                                          className="text-sm text-red-600"
                                        >
                                          Remove
                                        </button>

                                      </div>


                                      <div className="grid grid-cols-3 gap-3">

                                        {/* ATTRIBUTE */}

                                        <input
                                          type="text"
                                          placeholder="Variant option e.g. 128GB"
                                          value={
                                            variant
                                              .attributes
                                              ?.option ||
                                            ""
                                          }
                                          onChange={(
                                            e
                                          ) =>
                                            updateVariantAttribute(
                                              index,
                                              e
                                                .target
                                                .value
                                            )
                                          }
                                          className="rounded-lg border px-3 py-2"
                                        />


                                        {/* PRICE */}

                                        <input
                                          type="number"
                                          placeholder="Variant Price"
                                          value={
                                            variant.price
                                          }
                                          onChange={(
                                            e
                                          ) =>
                                            updateVariant(
                                              index,
                                              "price",
                                              e
                                                .target
                                                .value
                                            )
                                          }
                                          className="rounded-lg border px-3 py-2"
                                        />


                                        {/* STOCK */}

                                        <input
                                          type="number"
                                          placeholder="Variant Stock"
                                          value={
                                            variant.stock
                                          }
                                          onChange={(
                                            e
                                          ) =>
                                            updateVariant(
                                              index,
                                              "stock",
                                              e
                                                .target
                                                .value
                                            )
                                          }
                                          className="rounded-lg border px-3 py-2"
                                        />

                                      </div>

                                    </div>

                                  )
                                )}

                              </div>

                            </div>


                            {/* UPDATE BUTTONS */}

                            <div className="mt-4 flex gap-3">

                              <button
                                onClick={
                                  handleEditProduct
                                }
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                              >
                                Update Product
                              </button>

                              <button
                                onClick={
                                  closeForm
                                }
                                className="rounded-lg border px-4 py-2"
                              >
                                Cancel
                              </button>

                            </div>

                          </div>

                        </td>

                      </tr>

                    )}

                </React.Fragment>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}