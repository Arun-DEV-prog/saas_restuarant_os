"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  ScanLine,
  ShoppingCart,
  CreditCard,
  Armchair,
  CheckCircle,
} from "lucide-react";

const steps = [
  {
    icon: ScanLine,
    title: "Scan & Start",
    desc: "Guests scan a QR or tap the screen to begin ordering instantly.",
    img: "/sideQR.jpg",
  },
  {
    icon: ShoppingCart,
    title: "Browse & Order",
    desc: "Select food from multiple vendors in one unified cart.",
    img: "/menuQR.jpg",
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    desc: "Complete payment via card, wallet, or QR in seconds.",
    img: "/pay.jpg",
  },
  {
    icon: Armchair,
    title: "Get Assigned a Table",
    desc: "System auto-assigns the best available table for your group.",
    img: "/table.jpg",
  },
  {
    icon: CheckCircle,
    title: "Enjoy & Reorder",
    desc: "Sit down, relax, and reorder anytime using your table QR.",
    img: "/enjoy.jpg",
  },
];

export default function HowItWorks() {
  const timelineRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-out", once: true });

    const handleScroll = () => {
      if (!timelineRef.current) return;

      const timelineTop = timelineRef.current.getBoundingClientRect().top;
      const viewportHeight = window.innerHeight;

      // Calculate how much of the timeline should be visible
      let newHeight = Math.min(
        Math.max(viewportHeight - timelineTop, 0),
        timelineRef.current.scrollHeight,
      );
      setLineHeight(newHeight);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      className="py-16 bg-gradient-to-br from-slate-50 via-white to-indigo-50"
      style={{ minHeight: "80vh" }}
    >
      <div className="max-w-7xl mx-auto px-6 overflow-y-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-4 py-1.5 rounded-full font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            From Entry to Eating — In Seconds
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            A seamless guest journey designed to remove lines, delays, and
            confusion.
          </p>
        </div>

        <div className="relative" ref={timelineRef}>
          {/* Timeline vertical line */}
          <div className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 w-1 bg-indigo-200 rounded h-full"></div>
          {/* Animated growing line */}
          <div
            className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 w-1 bg-indigo-500 rounded"
            style={{
              height: `${lineHeight}px`,
              transition: "height 0.3s ease-out",
            }}
          ></div>

          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            const StepIcon = step.icon;

            return (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 200}
                className="relative mb-20 md:mb-32 flex flex-col md:flex-row items-center md:justify-between"
              >
                {/* Left side: text */}
                <div
                  className={`md:w-5/12 ${isLeft ? "md:text-right md:pr-12" : "md:text-left md:pl-12"} z-10`}
                >
                  <div className="inline-flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <span className="text-indigo-600 font-semibold text-sm">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-slate-600">{step.desc}</p>
                </div>

                {/* Center timeline dot */}
                <div className="hidden md:flex absolute left-1/2 top-6 transform -translate-x-1/2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 border-4 border-white shadow-lg"></div>
                </div>

                {/* Right side: image */}
                <div
                  className={`md:w-5/12 mt-6 md:mt-0 ${isLeft ? "md:pl-12" : "md:pr-12"}`}
                >
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={step.img}
                      alt={step.title}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
