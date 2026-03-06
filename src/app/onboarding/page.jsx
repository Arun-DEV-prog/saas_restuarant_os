"use client";

import { useState } from "react";

export default function Onboarding() {
  const [email, setEmail] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/stripe/connect", {
      method: "POST",
      body: JSON.stringify({ restaurantId: "your-restaurant-id" }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Start Stripe Onboarding</button>
    </form>
  );
}
