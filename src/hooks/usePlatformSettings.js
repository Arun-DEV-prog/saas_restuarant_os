"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to fetch platform settings (logo, name, etc.)
 * Returns platform settings from the API
 */
export function usePlatformSettings() {
  const [settings, setSettings] = useState({
    platformName: "RestaurantOS",
    platformLogo: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/public/settings", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch settings");

        const data = await res.json();
        setSettings(
          data.settings || {
            platformName: "RestaurantOS",
            platformLogo: null,
          },
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching platform settings:", err);
        setError(err.message);
        // Use defaults on error
        setSettings({
          platformName: "RestaurantOS",
          platformLogo: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
