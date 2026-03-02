"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is an online management system?",
    answer:
      "Online management systems are integrated digital platforms that centralize restaurant operations, including menu design, order processing, sales tracking, and customer engagement. They empower restaurants to improve efficiency, accuracy, and real-time insights for sustainable growth.",
  },
  {
    question: "What are digital menus in an online management system?",
    answer:
      "Digital menus allow restaurants to present items online through QR codes or web links. They can be updated in real-time, reducing printing costs and improving customer experience.",
  },
  {
    question: "Can a digital menu be saved as a QR code?",
    answer:
      "Yes. Digital menus can be generated as QR codes that customers can scan to instantly access your menu on their devices.",
  },
  {
    question: "Are QR code menus free?",
    answer:
      "Some platforms offer free basic QR menus, while advanced features may require a subscription plan.",
  },
  {
    question: "How do I get a QR code for my menu?",
    answer:
      "You can generate a QR code through a digital menu platform. Once created, download and print the QR code for tables or marketing materials.",
  },
];

export default function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-gray-100">
      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-16">
          Frequently Asked Questions
        </h2>

        {/* Accordion Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 divide-y divide-gray-200">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div key={index} className="p-6">
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <span className="text-md md:text-xl font-semibold text-slate-800">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`w-6 h-6 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-6"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden text-slate-600 leading-relaxed">
                    {faq.answer}
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
