"use client";

import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Abby G.",
    role: "Restaurant Owner",
    image: "/feedback.jpg",
    review:
      "We increased our average order size by 20% when we launched our QR code dine-in ordering in our restaurants. It’s very easy to implement, and our customers love fast and convenient service.",
  },
  {
    name: "Peter P.",
    role: "Head of Marketing",
    image: "/feedback.jpg",
    review:
      "I was able to save both money and time. I recommend MallInsight to those who have restaurants and small food businesses. Two thumbs up for coming up with a helpful online tool.",
  },
  {
    name: "Adrian W.",
    role: "General Manager",
    image: "/feedback.jpg",
    review:
      "I recommend Mall Insight for anyone looking to expand their restaurant business and add a digital edge. It's easy, user-friendly, and highly cost-effective.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-20">
          Read our reviews from our satisfied customers
        </h2>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {testimonials.map((item, i) => (
            <div key={i} className="text-center">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 relative rounded-full overflow-hidden shadow-md">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Name */}
              <h3 className="text-2xl font-semibold text-emerald-600">
                {item.name}
              </h3>

              {/* Role */}
              <p className="text-emerald-500 mb-4">{item.role}</p>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-8">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="w-5 h-5 fill-orange-500 text-orange-500"
                  />
                ))}
              </div>

              {/* Review Card */}
              <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-200 text-slate-700 leading-relaxed">
                {item.review}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
