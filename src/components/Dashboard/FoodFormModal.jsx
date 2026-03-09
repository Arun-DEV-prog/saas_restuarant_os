"use client";

import { useState } from "react";
import { X, UploadCloud } from "lucide-react";

export default function FoodFormModal({
  restaurantId,
  categoryId,
  initialData,
  onClose,
  onSaved,
}) {
  console.log("FoodFormModal opened with categoryId:", categoryId);

  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    image: initialData?.image || "",
    isAvailable: initialData?.isAvailable ?? true,
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initialData;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleImageUpload(file) {
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await res.json();
      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Food name is required");
      return;
    }

    if (!form.price || parseFloat(form.price) < 0) {
      alert("Valid price is required");
      return;
    }

    setSubmitting(true);

    try {
      const url = isEdit
        ? `/api/restaurants/${restaurantId}/foods/${initialData._id}`
        : `/api/restaurants/${restaurantId}/categories/${categoryId}/foods`;

      console.log("Submitting to URL:", url);
      console.log("CategoryId in submit:", categoryId);
      console.log("Form data:", form);

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to ${isEdit ? "update" : "create"} food item`,
        );
      }

      const data = await res.json();
      console.log("API Response:", data);

      // Handle both response formats:
      // 1. API returns complete object: { _id, name, price, categoryId, ... }
      // 2. API returns just insertedId: { insertedId: "..." }
      let savedFood;
      if (isEdit) {
        savedFood = {
          ...form,
          _id: initialData._id,
          categoryId: initialData.categoryId,
        };
      } else {
        if (data._id) {
          // API returned complete object
          savedFood = { ...data, categoryId };
        } else if (data.insertedId) {
          // API returned just insertedId
          savedFood = { ...form, _id: data.insertedId, categoryId };
        } else {
          throw new Error("No ID in response from create food API");
        }
      }

      console.log("Food saved successfully:", savedFood);
      onSaved(savedFood, isEdit ? "update" : "create");
      setSubmitting(false);
    } catch (error) {
      console.error("Submit error:", error);
      alert(`Error: ${error.message}`);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">{isEdit ? "Edit Food" : "Add Food"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Food Image</label>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
              {form.image ? (
                <img
                  src={form.image}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UploadCloud className="text-gray-400" />
              )}
            </div>

            <label className="cursor-pointer text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading || submitting}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <input
          name="name"
          placeholder="Food name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={submitting}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={submitting}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          step="0.01"
          min="0"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={submitting}
        />

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="isAvailable"
            checked={form.isAvailable}
            onChange={handleChange}
            disabled={submitting}
          />
          Available
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50 transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || submitting}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
