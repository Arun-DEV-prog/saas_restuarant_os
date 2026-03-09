"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function CategoryFormModal({
  restaurantId,
  initialData,
  onClose,
  onCreated,
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initialData;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    setSubmitting(true);

    try {
      const url = isEdit
        ? `/api/restaurants/${restaurantId}/categories/${initialData._id}`
        : `/api/restaurants/${restaurantId}/categories`;

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to ${isEdit ? "update" : "create"} category`,
        );
      }

      const data = await res.json();

      // For create: API should return the full category object with _id
      // For edit: return updated category
      const category = isEdit
        ? { ...initialData, name: name.trim(), description: description.trim() }
        : data;

      console.log("Category saved successfully:", category);
      onCreated(category);
      onClose();
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
        className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">
            {isEdit ? "Edit Category" : "Add Category"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>

        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={submitting}
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={submitting}
        />

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
            disabled={submitting}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
