import Accordion from "@/components/ui/Accordion";
import CountUpStats from "@/components/ui/CountUpStats";
import Features from "@/components/ui/Features";
import Hero from "@/components/ui/Hero";
import HowItWorks from "@/components/ui/HowItWorks";
import RestaurantShowcase from "@/components/ui/RestaurantShowcase";
import Testimonials from "@/components/ui/Testimonial";
import Image from "next/image";

import CountUp from "react-countup";

export default function Home() {
  return (
    <div>
      <Hero />
      <RestaurantShowcase />
      <div className="py-5">
        {" "}
        <CountUpStats />
      </div>

      <Features />
      <HowItWorks />
      <Testimonials />
      <Accordion />
    </div>
  );
}
