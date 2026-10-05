"use client";

import React from "react";
import { Zap, Shield, Truck, CheckCircle2, Award, Headphones } from "lucide-react";

export default function WhyChooseUs() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef(null);

  const handleScroll = (e) => {
    const container = e.currentTarget;
    const cardWidth = container.scrollWidth / features.length;
    const index = Math.round(container.scrollLeft / cardWidth);
    if (index >= 0 && index < features.length) {
      setActiveIndex(index);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Ultra High-Speed Signal Integrity",
      description: "Next-generation signal shielding and premium copper conductors deliver loss-free 4K/8K display transmission and 10Gbps high-speed data transfer."
    },
    {
      icon: Shield,
      title: "Multi-Layer Circuit Protection",
      description: "Equipped with active EMI shielding, over-voltage suppressors, ESD anti-static protection, and gold-plated corrosion resistant connectors."
    },
    {
      icon: Truck,
      title: "48-Hour Pan-India Delivery",
      description: "Get your essential connectivity gear fast. Same-day dispatch with express air shipping to all major Indian cities within 48 hours."
    },
    {
      icon: CheckCircle2,
      title: "100% Quality Inspected & Tested",
      description: "Every single accessory undergoes rigorous multi-point testing before packaging and dispatch to ensure zero-defect reliability."
    },
    {
      icon: Award,
      title: "BIS / CE Certified Products",
      description: "Tested and approved. Every single RAVTRON product is certified by national and international safety commissions to meet absolute quality standards."
    },
    {
      icon: Headphones,
      title: "24/7 Dedicated Support",
      description: "Our customer success squad is always online. Contact us via WhatsApp or email for instant product advice, setup, and troubleshooting."
    }
  ];

  return (
    <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]/20">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">

        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
            <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
              Engineering Excellence
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1E293B] tracking-tight">
            Built Different. Built Better.
          </h2>
          <p className="text-sm font-semibold text-[#1E293B]/50">
            We merge premium material engineering with smart electrical design to power your lifestyle seamlessly.
          </p>
        </div>

        {/* Features Grid (Horizontal Scroll on Mobile, Grid on Desktop) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-none"
        >
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={feat.title}
                className="group rounded-3xl bg-white border border-[#1E293B]/10 p-6 md:p-8 hover-lift transition-all flex-shrink-0 w-[270px] sm:w-[320px] md:w-auto snap-center"
              >
                {/* Icon Sphere */}
                <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] group-hover:bg-[#578FCA] text-[#3674B5] group-hover:text-white flex items-center justify-center transition-all duration-300">
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-lg text-[#1E293B] mt-4 md:mt-6 transition-colors group-hover:text-[#3674B5]">
                  {feat.title}
                </h3>
                <p className="text-sm text-[#1E293B]/60 leading-relaxed mt-2 md:mt-2.5 font-medium">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile Page Indicators */}
        <div className="flex justify-center gap-1.5 pt-2 md:hidden">
          {features.map((_, idx) => (
            <button
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx ? "w-6 bg-[#3674B5]" : "w-1.5 bg-[#3674B5]/20"
              }`}
              onClick={() => {
                if (scrollRef.current) {
                  const cardWidth = scrollRef.current.scrollWidth / features.length;
                  scrollRef.current.scrollTo({
                    left: idx * cardWidth,
                    behavior: "smooth"
                  });
                }
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
