"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const restaurants = [
  {
    name: "Burger Palace",
    slug: "burger-palace",
    logo: "/happy-waiter-serving-food-group-cheerful-friends-pub.jpg",
    category: "Fast Food",
    items: ["Cheese Burger", "Chicken Burger", "Fries", "Milkshake"],
  },
  {
    name: "Pizza Hub",
    slug: "pizza-hub",
    logo: "/happy-waiter-serving-food-group-cheerful-friends-pub.jpg",
    category: "Italian",
    items: ["Pepperoni Pizza", "Veg Supreme", "Garlic Bread", "Pasta"],
  },
  {
    name: "Spice Kingdom",
    slug: "spice-kingdom",
    logo: "/happy-waiter-serving-food-group-cheerful-friends-pub.jpg",
    category: "Asian",
    items: ["Butter Chicken", "Biryani", "Naan", "Kebab"],
  },
  {
    name: "Sweet Treats",
    slug: "sweet-treats",
    logo: "/restaurants/dessert.png",
    category: "Desserts",
    items: ["Chocolate Cake", "Donuts", "Ice Cream", "Cupcakes"],
  },
];

export default function RestaurantShowcase() {
  return (
    <section className="py-28 bg-gradient-to-b from-zinc-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-20">
          <Badge className="mb-4 bg-indigo-100 text-indigo-600 hover:bg-indigo-100 border-0">
            Live Restaurants
          </Badge>

          <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 mb-6 tracking-tight">
            Find your next favorite bite
          </h2>

          <p className="text-zinc-600 max-w-2xl mx-auto text-lg">
            Discover menus, compare options, and order instantly — all in one
            smooth experience.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {restaurants.map((res, i) => (
            <Card
              key={i}
              className="group rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden ring-1 ring-zinc-200 group-hover:ring-indigo-400 transition">
                    <Image
                      src={res.logo}
                      alt={res.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div>
                    <Link
                      href={`/restaurants/${res.slug}`}
                      className="font-semibold text-xl text-zinc-900 hover:text-indigo-600 transition-colors"
                    >
                      {res.name}
                    </Link>

                    <p className="text-sm text-indigo-600 font-medium">
                      {res.category}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <ul className="text-sm text-zinc-600 space-y-2">
                  {res.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{item}</span>
                      <span className="text-zinc-400">•</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant="ghost"
                  className="w-full rounded-full bg-zinc-100 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                >
                  View Menu →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition group"
          >
            View all restaurants
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
