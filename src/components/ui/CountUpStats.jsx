"use client";

import CountUp from "react-countup";

export default function CountUpStats() {
  const stats = [
    { value: 20000000, label: "USERS" },
    { value: 7000, label: "RESTAURANTS" },
    { value: 100000000, label: "ORDERS" },
  ];

  return (
    <section className="py-8 bg-[#432dd7] rounded-3xl mx-6 md:mx-20">
      <div className="max-w-8xl mx-auto flex flex-col md:flex-row justify-around items-center gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-white text-center"
          >
            <span className="text-4xl md:text-5xl font-extrabold">
              <CountUp
                start={0}
                end={stat.value}
                duration={2.5}
                separator=","
              />
              {stat.value >= 1000000 ? "M+" : "+"}
            </span>
            <span className="mt-2 text-sm md:text-base font-semibold tracking-wide">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
