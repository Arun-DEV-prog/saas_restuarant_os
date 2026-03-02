// app/(dashboard)/dashboard/[restaurantId]/settings/page.jsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  Save,
  Camera,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "orders", label: "Order Settings", icon: ShoppingCart },
  { id: "developer", label: "Developer", icon: Wifi },
  { id: "billing", label: "Billing", icon: CreditCard },
];

// ── Input components ──────────────────────────────────────────────────────────
function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10
                 bg-white dark:bg-white/5 text-gray-900 dark:text-white
                 placeholder:text-gray-400 dark:placeholder:text-gray-500
                 focus:outline-none focus:ring-2 focus:ring-emerald-500
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
                 focus:outline-none focus:ring-2 focus:ring-emerald-500
                 transition text-sm resize-none min-h-[100px]"
    />
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Logo Uploader ─────────────────────────────────────────────────────────────
function LogoUploader({ restaurantId, currentLogo }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentLogo || null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(f) {
    if (!f?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setPreview(URL.createObjectURL(f));
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", f);
      const res = await fetch(`/api/restaurants/${restaurantId}/logo`, {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        toast.success("Logo updated");
      } else {
        toast.error("Failed to upload logo");
      }
    } catch (err) {
      toast.error("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete logo?")) return;
    setUploading(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/logo`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPreview(null);
        toast.success("Logo removed");
      }
    } catch (err) {
      toast.error("Delete error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Logo</p>
      <div
        className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 group cursor-pointer"
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
        {preview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center"
          >
            <X size={12} />
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

// ── Hero Uploader ─────────────────────────────────────────────────────────────
function HeroUploader({ restaurantId, currentHero }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentHero || null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/restaurants/${restaurantId}/hero-image`, {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        setFile(null);
        toast.success("Hero image updated");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Remove hero image?")) return;
    setUploading(true);
    try {
      await fetch(`/api/restaurants/${restaurantId}/hero-image`, {
        method: "DELETE",
      });
      setPreview(null);
      setFile(null);
      toast.success("Hero image removed");
    } catch (err) {
      toast.error("Delete error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Hero Image (1920x600px)</p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f?.type.startsWith("image/")) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
          }
        }}
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-40 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 cursor-pointer flex items-center justify-center hover:border-orange-500 transition"
      >
        {preview ? (
          <img
            src={preview}
            alt="Hero"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <UploadCloud className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm text-gray-500">Drag or click to upload</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Uploading
              </>
            ) : (
              <>
                <CheckCircle size={16} /> Upload
              </>
            )}
          </button>
        )}
        {preview && !file && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash size={16} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
          }
        }}
      />
    </div>
  );
}

// ── API Keys Section ──────────────────────────────────────────────────────────
function APIKeysSection({ restaurantId }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, [restaurantId]);

  async function loadApiKeys() {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/api-keys`);
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
    } catch (err) {
      console.error("Failed to load API keys:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createApiKey() {
    if (!newKeyName) {
      toast.error("Enter a key name");
      return;
    }
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      setCreatedKey(data);
      setNewKeyName("");
      loadApiKeys();
      toast.success("API key created");
    } catch (err) {
      toast.error("Failed to create key");
    }
  }

  async function deleteApiKey(id) {
    if (!confirm("Delete this key?")) return;
    try {
      await fetch(`/api/restaurants/${restaurantId}/api-keys`, {
        method: "DELETE",
      });
      loadApiKeys();
      toast.success("Key deleted");
    } catch (err) {
      toast.error("Failed to delete key");
    }
  }

  return (
    <div className="space-y-6">
      {createdKey && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300 mb-2">
            Save your API key (shown only once):
          </p>
          <div className="flex items-center gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={createdKey.key}
              readOnly
              className="flex-1 px-3 py-2 bg-white dark:bg-white/10 border rounded text-sm"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdKey.key);
                toast.success("Copied!");
              }}
              className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded"
            >
              <Copy size={16} />
            </button>
          </div>
          <button
            onClick={() => setCreatedKey(null)}
            className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Create new API key</label>
        <div className="flex gap-2">
          <Input
            placeholder="Key name (e.g., Production, Testing)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <button
            onClick={createApiKey}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 whitespace-nowrap flex items-center gap-2"
          >
            <Plus size={16} /> Create
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Active keys</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : apiKeys.length === 0 ? (
          <p className="text-sm text-gray-500">No API keys created</p>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10"
              >
                <div>
                  <p className="text-sm font-medium">{key.name}</p>
                  <p className="text-xs text-gray-500">
                    **{key.lastChars} • Created{" "}
                    {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteApiKey(key.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Settings Component ───────────────────────────────────────────────────
export default function SettingsPage() {
  const params = useParams();
  const restaurantId = params?.restaurantId;

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    },
    notifications: {
      orderAlerts: true,
      tableAlerts: true,
      lowStockAlerts: true,
      emailNotifications: true,
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
    loadSettings();
  }, [restaurantId]);

  async function loadSettings() {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      toast.error("Failed to load settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  }

  if (!restaurantId || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving
            </>
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="flex gap-6">
              <LogoUploader
                restaurantId={restaurantId}
                currentLogo={settings.media?.logo}
              />
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium">Restaurant Name</label>
                  <Input
                    value={settings.profile.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: { ...settings.profile, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: { ...settings.profile, email: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={settings.profile.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: { ...settings.profile, phone: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={settings.profile.description}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: {
                      ...settings.profile,
                      description: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={settings.profile.category}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, category: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5"
              >
                <option value="">Select category</option>
                <option value="italian">Italian</option>
                <option value="chinese">Chinese</option>
                <option value="indian">Indian</option>
                <option value="fast-food">Fast Food</option>
                <option value="desserts">Desserts</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>
          </div>
        )}

        {/* Restaurant Tab */}
        {activeTab === "restaurant" && (
          <div className="space-y-6">
            <HeroUploader
              restaurantId={restaurantId}
              currentHero={settings.media?.heroImage}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={settings.restaurant.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      restaurant: {
                        ...settings.restaurant,
                        address: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={settings.restaurant.city}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      restaurant: {
                        ...settings.restaurant,
                        city: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={settings.restaurant.country}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      restaurant: {
                        ...settings.restaurant,
                        country: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Zip Code</label>
                <Input
                  value={settings.restaurant.zipCode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      restaurant: {
                        ...settings.restaurant,
                        zipCode: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mall Name</label>
                <Input
                  value={settings.restaurant.mallName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      restaurant: {
                        ...settings.restaurant,
                        mallName: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Operating Hours</label>
                <Input
                  placeholder="e.g., 9 AM - 11 PM"
                  value={settings.restaurant.hours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      restaurant: {
                        ...settings.restaurant,
                        hours: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                </div>
                <Toggle
                  checked={value}
                  onChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        [key]: checked,
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* Order Settings Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Minimum Order Value</label>
              <Input
                type="number"
                value={settings.orders.minOrderValue}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    orders: {
                      ...settings.orders,
                      minOrderValue: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Delivery Fee</label>
              <Input
                type="number"
                value={settings.orders.deliveryFee}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    orders: {
                      ...settings.orders,
                      deliveryFee: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tax Rate (%)</label>
              <Input
                type="number"
                value={settings.orders.taxRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    orders: {
                      ...settings.orders,
                      taxRate: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
              <p className="font-medium">Accepting Orders</p>
              <Toggle
                checked={settings.orders.acceptingOrders}
                onChange={(checked) =>
                  setSettings({
                    ...settings,
                    orders: {
                      ...settings.orders,
                      acceptingOrders: checked,
                    },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Developer Tab */}
        {activeTab === "developer" && (
          <APIKeysSection restaurantId={restaurantId} />
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Billing features coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
