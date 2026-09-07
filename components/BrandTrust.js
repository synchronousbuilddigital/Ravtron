"use client";

import React from "react";

export default function BrandTrust() {
  const categoriesAndProducts = [
    "High-Speed Display Cables",
    "Multiport Type-C Converters",
    "Type-C Multiport Docking Stations",
    "Pro HDMI 2.1 & Display Converters",
    "4K HD Webcams & Privacy Filters",
    "Cat6 Networking & Patch Cords",
    "Surveillance Cables & PoE Switches",
    "Audio Video Extenders & Splitters",
    "USB Type-C Multiport Hubs",
    "Workstation Connectivity Solutions"
  ];

  return (
    <section className="py-4 md:py-8 bg-white border-y border-[#1E293B]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex flex-col items-center text-center">
        <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-widest">
          Explore RAVTRON Categories & Featured Products
        </span>
      </div>

      {/* Infinite scrolling marquee wrapper with dynamic side fading mask */}
      <div 
        className="relative w-full flex items-center overflow-hidden pointer-events-none"
        style={{
          maskImage: "linear-gradient(to right, transparent, #fff 4%, #fff 96%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #fff 4%, #fff 96%, transparent)"
        }}
      >

        {/* Marquee Body */}
        <div className="animate-marquee whitespace-nowrap flex gap-10 sm:gap-16 items-center">
          {/* Double list to support seamless infinite loop */}
          {[...categoriesAndProducts, ...categoriesAndProducts].map((item, idx) => (
            <div 
              key={`${item}-${idx}`}
              className="flex items-center gap-2.5 font-display font-black text-[#1E293B]/70 hover:text-[#3674B5] transition-colors text-xs sm:text-sm tracking-wider uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-[#3674B5]"></span>
              <span>{item}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
