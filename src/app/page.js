"use client";
import Accordion from "@/components/ui/Accordion";
import CountUpStats from "@/components/ui/CountUpStats";
import Features from "@/components/ui/Features";
import Footer from "@/components/ui/Footer";
import Hero from "@/components/ui/Hero";
import HowItWorks from "@/components/ui/HowItWorks";
import Navbar from "@/components/ui/Navber";
import RestaurantShowcase from "@/components/ui/RestaurantShowcase";
import Testimonials from "@/components/ui/Testimonial";
import Image from "next/image";
import dynamic from "next/dynamic";

import CountUp from "react-countup";
import { div } from "three/tsl";

const RestaurantsLanding = dynamic(
  () => import("@/components/RestuarantsLanding"),
  { ssr: false },
);

export default function Home() {
  return (
    //<div>
    //  <Navbar />
    //  <Hero />
    //  <RestaurantShowcase />
    //  <div className="py-5">
    //    {" "}
    //    <CountUpStats />
    //  </div>

    //  <Features />
    //  <HowItWorks />
    //  <Testimonials />
    //  <Accordion />
    //  <Footer />
    //</div>
    <div className=" mt-10">
      <RestaurantsLanding />
    </div>
  );
}
