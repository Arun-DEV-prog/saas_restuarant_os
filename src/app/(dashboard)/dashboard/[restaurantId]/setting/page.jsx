// app/(dashboard)/dashboard/[restaurantId]/setting/page.jsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  ImagePlus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  User,
  UtensilsCrossed,
  Bell,
  ShoppingCart,
  Wifi,
  CreditCard,
  LayoutGrid,
  Save,
  Camera,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  Hash,
} from "lucide-react";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "orders", label: "Order Settings", icon: ShoppingCart },
  { id: "developer", label: "Developer", icon: Wifi },
  { id: "billing", label: "Billing", icon: CreditCard },
];

// ── Reusable field components ─────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10
                 bg-white dark:bg-white/5 text-gray-900 dark:text-white
                 placeholder:text-gray-400 dark:placeholder:text-gray-500
                 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                 transition text-sm"
    />
  );
}

function Textarea({ ...props }) {
  return (
    <textarea
      {...props}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10
                 bg-white dark:bg-white/5 text-gray-900 dark:text-white
                 placeholder:text-gray-400 dark:placeholder:text-gray-500
                 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                 transition text-sm resize-none"
    />
  );
}

// ── Logo uploader (small square like in screenshot) ───────────────────────────
function LogoUploader({ restaurantId }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(f) {
    if (!f?.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(f));
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", f);
      await fetch(`/api/restaurants/${restaurantId}/logo`, {
        method: "POST",
        body: form,
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Logo
      </p>
      <div
        className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 group cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Logo"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <Camera size={22} className="text-gray-400" />
            <span className="text-xs text-gray-400">Upload</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 size={18} className="text-white animate-spin" />
          ) : (
            <Camera size={18} className="text-white" />
          )}
        </div>
        {/* Delete button overlay */}
        {preview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow transition"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ── Hero Image Uploader ───────────────────────────────────────────────────────
function HeroUploader({ restaurantId }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);

  function applyFile(f) {
    if (!f.type.startsWith("image/")) {
      setErrorMsg("Please select an image file.");
      setStatus("error");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleUpload() {
    if (!file || !restaurantId) return;
    setStatus("uploading");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/restaurants/${restaurantId}/hero-image`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFile(null);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Remove hero image and show default?")) return;
    setStatus("uploading");
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/hero-image`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setPreview(null);
      setFile(null);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Menu Page Hero Banner
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Full-width banner shown at the top of your public menu. Recommended:{" "}
          <strong>1920 × 600 px</strong>
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) applyFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full h-44 rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all select-none
          ${dragging ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-gray-200 dark:border-white/10 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-white/5"}`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Hero preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <UploadCloud size={18} className="text-white" />
              <span className="text-white font-semibold text-sm">
                Click to change
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
            <ImagePlus size={32} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Click or drag & drop your banner image
            </p>
            <p className="text-xs text-gray-400">
              JPG · PNG · WebP · max 10 MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) applyFile(f);
        }}
      />

      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading"}
          className="flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-semibold text-sm transition bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-white/10"
        >
          {status === "uploading" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Uploading…
            </>
          ) : status === "success" ? (
            <>
              <CheckCircle size={14} /> Saved!
            </>
          ) : (
            <>
              <UploadCloud size={14} />{" "}
              {file ? "Upload Banner" : "Select image first"}
            </>
          )}
        </button>
        {preview && !file && (
          <button
            onClick={handleDelete}
            disabled={status === "uploading"}
            className="flex items-center gap-1.5 py-2 px-4 rounded-lg font-semibold text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 disabled:opacity-50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 transition"
          >
            <Trash2 size={14} /> Remove
          </button>
        )}
        {file && (
          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
              setStatus("idle");
              setErrorMsg("");
            }}
            className="py-2 px-4 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300 transition"
          >
            Cancel
          </button>
        )}
      </div>
      {status === "error" && errorMsg && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
          <AlertCircle size={13} /> {errorMsg}
        </div>
      )}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-gray-200 dark:bg-white/20"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB PANELS
// ══════════════════════════════════════════════════════════════════════════════

function ProfileTab({ settings, onSettingsChange, restaurantId }) {
  const updateProfile = (key, value) => {
    onSettingsChange({
      ...settings,
      profile: { ...settings.profile, [key]: value },
    });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <LogoUploader restaurantId={restaurantId} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" required>
          <Input
            value={settings.profile.name || ""}
            onChange={(e) => updateProfile("name", e.target.value)}
            placeholder="Restaurant name"
          />
        </Field>
        <Field label="Category">
          <Input
            value={settings.profile.category || ""}
            onChange={(e) => updateProfile("category", e.target.value)}
            placeholder="Italian, Japanese, etc."
          />
        </Field>
      </div>
      <Field label="Email address" required>
        <Input
          type="email"
          value={settings.profile.email || ""}
          onChange={(e) => updateProfile("email", e.target.value)}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Phone number">
        <Input
          type="tel"
          value={settings.profile.phone || ""}
          onChange={(e) => updateProfile("phone", e.target.value)}
          placeholder="+1 234 567 8900"
        />
      </Field>
      <Field label="Description">
        <Textarea
          value={settings.profile.description || ""}
          onChange={(e) => updateProfile("description", e.target.value)}
          placeholder="Brief description of your restaurant"
          rows="4"
        />
      </Field>
    </div>
  );
}

function RestaurantTab({ settings, onSettingsChange, restaurantId }) {
  const updateRestaurant = (key, value) => {
    onSettingsChange({
      ...settings,
      restaurant: { ...settings.restaurant, [key]: value },
    });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Hero image section */}
      <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
        <HeroUploader restaurantId={restaurantId} />
      </div>

      {/* Basic info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Basic Info
        </h3>
        <Field label="Restaurant name" required>
          <Input
            value={settings.restaurant.name || ""}
            onChange={(e) => updateRestaurant("name", e.target.value)}
            placeholder="My Restaurant"
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={settings.restaurant.description || ""}
            onChange={(e) => updateRestaurant("description", e.target.value)}
            rows={3}
            placeholder="Tell customers about your restaurant…"
          />
        </Field>
        <Field label="Cuisine category">
          <select
            value={settings.restaurant.category || ""}
            onChange={(e) => updateRestaurant("category", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
          >
            <option value="">Select a category</option>
            {[
              "Italian",
              "Japanese",
              "American",
              "Chinese",
              "Mexican",
              "Indian",
              "Thai",
              "Mediterranean",
              "French",
              "Other",
            ].map((c) => (
              <option key={c} value={c.toLowerCase()}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Contact & Location
        </h3>
        <Field label="Address">
          <Input
            value={settings.restaurant.address || ""}
            onChange={(e) => updateRestaurant("address", e.target.value)}
            placeholder="123 Main St, City, Country"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone">
            <Input
              type="tel"
              value={settings.restaurant.phone || ""}
              onChange={(e) => updateRestaurant("phone", e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={settings.restaurant.email || ""}
              onChange={(e) => updateRestaurant("email", e.target.value)}
              placeholder="info@restaurant.com"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Opening hours">
            <Input
              value={settings.restaurant.hours || ""}
              onChange={(e) => updateRestaurant("hours", e.target.value)}
              placeholder="Mon-Sun 9:00-22:00"
            />
          </Field>
          <Field label="Website">
            <Input
              type="url"
              value={settings.restaurant.website || ""}
              onChange={(e) => updateRestaurant("website", e.target.value)}
              placeholder="https://myrestaurant.com"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ settings, onSettingsChange }) {
  const updateNotification = (key, value) => {
    onSettingsChange({
      ...settings,
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Dashboard Alerts
        </p>
        <Toggle
          checked={settings.notifications.orderAlerts || false}
          onChange={(val) => updateNotification("orderAlerts", val)}
          label="New order received"
          description="Play sound and show badge when a new order comes in"
        />
        <Toggle
          checked={settings.notifications.tableAlerts || false}
          onChange={(val) => updateNotification("tableAlerts", val)}
          label="Waiter called"
          description="Alert when a table requests service"
        />
        <Toggle
          checked={settings.notifications.lowStockAlerts || false}
          onChange={(val) => updateNotification("lowStockAlerts", val)}
          label="Low stock warning"
          description="Notify when a menu item is running low"
        />
      </div>
      <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Email Notifications
        </p>
        <Toggle
          checked={settings.notifications.emailNotifications || false}
          onChange={(val) => updateNotification("emailNotifications", val)}
          label="Email notifications"
          description="Receive email for important events"
        />
      </div>
    </div>
  );
}

function OrderSettingsTab({ settings, onSettingsChange }) {
  const updateOrders = (key, value) => {
    onSettingsChange({
      ...settings,
      orders: { ...settings.orders, [key]: value },
    });
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 space-y-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Order Settings
        </p>
        <Field label="Min order value">
          <Input
            type="number"
            value={settings.orders.minOrderValue || 0}
            onChange={(e) =>
              updateOrders("minOrderValue", parseFloat(e.target.value) || 0)
            }
            placeholder="0"
          />
        </Field>
        <Field label="Delivery fee">
          <Input
            type="number"
            value={settings.orders.deliveryFee || 0}
            onChange={(e) =>
              updateOrders("deliveryFee", parseFloat(e.target.value) || 0)
            }
            placeholder="0"
          />
        </Field>
        <Field label="Tax rate (%)">
          <Input
            type="number"
            step="0.1"
            value={settings.orders.taxRate || 10}
            onChange={(e) =>
              updateOrders("taxRate", parseFloat(e.target.value) || 0)
            }
            placeholder="10"
          />
        </Field>
        <Toggle
          checked={settings.orders.acceptingOrders !== false}
          onChange={(val) => updateOrders("acceptingOrders", val)}
          label="Accepting orders"
          description="Toggle to temporarily stop accepting new orders"
        />
      </div>
    </div>
  );
}

function DeveloperTab({ restaurantId }) {
  const [showKey, setShowKey] = useState(false);
  const apiKey =
    "mk_live_" +
    (restaurantId || "xxxx").slice(0, 8) +
    "_xxxxxxxxxxxxxxxxxxxxxxxx";
  const webhookUrl = `https://yourdomain.com/api/webhooks/${restaurantId}`;
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }
  return (
    <div className="max-w-xl space-y-6">
      <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 space-y-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          API Keys
        </p>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">
            Live API Key
          </label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-xs text-gray-700 dark:text-gray-300 overflow-hidden">
              <span className="truncate">
                {showKey
                  ? apiKey
                  : apiKey.replace(/./g, "•").slice(0, 32) + "••••"}
              </span>
            </div>
            <button
              onClick={() => setShowKey((v) => !v)}
              className="px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {showKey ? (
                <EyeOff size={15} className="text-gray-500" />
              ) : (
                <Eye size={15} className="text-gray-500" />
              )}
            </button>
            <button
              onClick={() => copyToClipboard(apiKey)}
              className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">
            Webhook URL
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={webhookUrl}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-mono text-xs text-gray-700 dark:text-gray-300"
            />
            <button
              onClick={() => copyToClipboard(webhookUrl)}
              className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
      <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
          ⚠️ Keep your API key secret
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-500">
          Never expose your API key in client-side code or public repositories.
          Rotate it immediately if compromised.
        </p>
      </div>
    </div>
  );
}

function BillingTab({ restaurantId }) {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!restaurantId) return;

    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch subscription details
        const subscRes = await fetch("/api/subscriptions/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurantId }),
        });

        if (!subscRes.ok) {
          throw new Error("Failed to fetch subscription");
        }

        const subscData = await subscRes.json();
        setSubscription(subscData.data);

        // Fetch usage data
        if (subscData.data?.subscription?.isActive) {
          const usageRes = await fetch("/api/subscriptions/usage", {
            headers: { "X-Restaurant-Id": restaurantId },
          });

          if (usageRes.ok) {
            const usageData = await usageRes.json();
            setUsage(usageData.data);
          }
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Loading billing info...
          </p>
        </div>
      </div>
    );
  }

  if (error || !subscription?.subscription) {
    return (
      <div className="max-w-xl">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
          <p className="text-amber-800 dark:text-amber-200">
            {error || "No active subscription found"}
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
            <Link
              href="/dashboard/billing"
              className="underline hover:no-underline"
            >
              Purchase a plan now
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const { subscription: sub, plan } = subscription;
  const renewalDate = new Date(sub.renewalDate).toLocaleDateString();

  const getGradientClass = () => {
    if (sub.status === "active")
      return "bg-gradient-to-br from-emerald-500 to-emerald-600";
    if (sub.status === "pending")
      return "bg-gradient-to-br from-amber-500 to-amber-600";
    return "bg-gradient-to-br from-red-500 to-red-600";
  };

  const getStatusBadgeClass = () => {
    if (sub.status === "active")
      return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300";
    if (sub.status === "pending")
      return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300";
    return "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Current Plan Card */}
      <div className={`p-5 rounded-2xl text-white ${getGradientClass()}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Current Plan
            </p>
            <p className="text-2xl font-bold mt-0.5">
              {plan?.name || "Free Plan"}
            </p>
          </div>
          <span
            className={`bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full capitalize`}
          >
            {sub.status}
          </span>
        </div>
        <p className="text-sm text-white/90 mb-4">
          {plan?.features && plan.features.length > 0
            ? plan.features.join(" · ")
            : "Basic features"}
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold">
              ${plan?.price || "0"}
              <span className="text-sm font-normal text-white/80">/month</span>
            </p>
            <p className="text-xs text-white/70 mt-1">
              Renews on {renewalDate}
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/30 transition"
          >
            Change Plan
          </Link>
        </div>
      </div>

      {/* Usage Statistics */}
      {usage && plan && (
        <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Monthly Usage
          </p>

          <div className="space-y-4">
            {/* Orders */}
            {plan.monthlyOrderLimit > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Orders
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {usage.ordersCount || 0} / {plan.monthlyOrderLimit}
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((usage.ordersCount || 0) / plan.monthlyOrderLimit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Table Requests */}
            {plan.monthlyTableRequestLimit > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Table Requests
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {usage.tableRequestsCount || 0} /{" "}
                    {plan.monthlyTableRequestLimit}
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((usage.tableRequestsCount || 0) / plan.monthlyTableRequestLimit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            {plan.monthlyMenuItemsLimit > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Menu Items
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {usage.menuItemsCount || 0} / {plan.monthlyMenuItemsLimit}
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((usage.menuItemsCount || 0) / plan.monthlyMenuItemsLimit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Users */}
            {plan.monthlyUsersLimit > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Users
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {usage.usersCount || 0} / {plan.monthlyUsersLimit}
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((usage.usersCount || 0) / plan.monthlyUsersLimit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Info */}
      <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Subscription Details
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-white/10 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Start Date
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {new Date(sub.startDate).toLocaleDateString()}
            </p>
          </div>

          {sub.endDate && (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-white/10 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                End Date
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(sub.endDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-white dark:bg-white/10 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Auto-Renewal
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {sub.autoRenewal ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function SettingPage() {
  const params = useParams();
  const restaurantId = params?.restaurantId;
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    profile: {
      name: "",
      email: "",
      phone: "",
      description: "",
      category: "",
    },
    restaurant: {
      address: "",
      city: "",
      country: "",
      zipCode: "",
      mallName: "",
      hours: "",
      website: "",
      phone: "",
      email: "",
      name: "",
      description: "",
    },
    notifications: {
      orderAlerts: true,
      tableAlerts: true,
      lowStockAlerts: false,
      emailNotifications: false,
    },
    orders: {
      minOrderValue: 0,
      deliveryFee: 0,
      taxRate: 10,
      acceptingOrders: true,
    },
    media: {
      logo: null,
      heroImage: null,
    },
  });

  // Load settings on mount
  useEffect(() => {
    if (!restaurantId) return;
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/restaurants/${restaurantId}/settings`);
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setSettings(data);
        setError("");
      } catch (err) {
        console.error("Error loading settings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [restaurantId]);

  async function handleSave() {
    if (!restaurantId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSaved(true);
      setError("");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const tabContent = {
    profile: (
      <ProfileTab
        settings={settings}
        onSettingsChange={setSettings}
        restaurantId={restaurantId}
      />
    ),
    restaurant: (
      <RestaurantTab
        settings={settings}
        onSettingsChange={setSettings}
        restaurantId={restaurantId}
      />
    ),
    notifications: (
      <NotificationsTab settings={settings} onSettingsChange={setSettings} />
    ),
    orders: (
      <OrderSettingsTab settings={settings} onSettingsChange={setSettings} />
    ),
    developer: <DeveloperTab restaurantId={restaurantId} />,
    billing: <BillingTab restaurantId={restaurantId} />,
  };

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        Loading...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-3 text-emerald-500" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080f1e]">
      {/* ── Sticky tab bar ── */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#0a1020] border-b border-gray-200 dark:border-white/10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-4 whitespace-nowrap text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === id
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center">
              {(() => {
                const T = TABS.find((t) => t.id === activeTab);
                return T ? (
                  <T.icon
                    size={18}
                    className="text-gray-600 dark:text-gray-300"
                  />
                ) : null;
              })()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {TABS.find((t) => t.id === activeTab)?.label} Settings
              </h1>
              <p className="text-xs text-gray-400">
                Manage your{" "}
                {TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}{" "}
                preferences
              </p>
            </div>
          </div>

          {/* Save button — hidden on billing & developer (read-only) */}
          {activeTab !== "billing" && activeTab !== "developer" && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition
                ${
                  saved
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                } disabled:opacity-60`}
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : saved ? (
                <>
                  <Check size={15} /> Saved!
                </>
              ) : (
                <>
                  <Save size={15} /> Save Changes
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Tab content ── */}
        <div className="bg-white dark:bg-[#0a1020] rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
          {tabContent[activeTab]}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
