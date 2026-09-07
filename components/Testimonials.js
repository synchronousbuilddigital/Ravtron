"use client";

import React from "react";
import { Star } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Aarav Mehta",
      initials: "AM",
      rating: 5,
      text: "The DisplayPort to HDMI adapter is a total lifesaver. It connects my 4K monitor effortlessly without any lag or frame drops, and the build quality feels super premium on my desk.",
      product: "RAVTRON 4K Ultra HD DisplayPort to HDMI Adapter"
    },
    {
      name: "Priya Sharma",
      initials: "PS",
      rating: 5,
      text: "Absolutely stunning docking station. Expanding dual 4K screens and connecting all my workstation peripherals with one single cable has transformed my workspace setup!",
      product: "RAVTRON 11-in-1 Type-C Multiport Docking Station"
    },
    {
      name: "Rohan Das",
      initials: "RD",
      rating: 5,
      text: "This HDMI display cable is amazing. Ultra crisp 4K 60Hz display feed without any signal loss. The braided fabric feels like it will last for ages, doesn't tangle at all.",
      product: "RAVTRON Ultra-Speed Braided 4K HDMI Cable"
    },
    {
      name: "Karan Johar",
      initials: "KJ",
      rating: 5,
      text: "Fitted the 4K webcam onto my monitor. The built-in ring light has completely changed how I look in zoom calls. Absolute value for money and beautiful design.",
      product: "RAVTRON Ultra HD 4K Ringlight Webcam"
    }
  ];

  return (
    <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]/40">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
              <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
                User Satisfaction
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1E293B] tracking-tight">
              What Our Customers Say
            </h2>
          </div>
          <p className="text-sm font-semibold text-[#1E293B]/50 max-w-sm">
            Read authentic experiences from creators, tech enthusiasts, and professionals.
          </p>
        </div>

        {/* Reviews Marquee with dynamic side fading mask */}
        <div 
          className="relative w-full overflow-hidden py-4 -my-4"
          style={{
            maskImage: "linear-gradient(to right, transparent, #fff 4%, #fff 96%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, #fff 4%, #fff 96%, transparent)"
          }}
        >

          <div className="animate-marquee flex gap-8">
            {[...reviews, ...reviews].map((rev, index) => (
              <div
                key={`${rev.name}-${index}`}
                className="w-[320px] sm:w-[380px] flex-shrink-0 rounded-3xl bg-white border border-[#1E293B]/10 p-6 flex flex-col justify-between hover-lift transition-all"
              >
                <div className="space-y-4">
                  {/* Star Rating Row */}
                  <div className="flex items-center gap-1 text-sm">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-[#1E293B]/80 leading-relaxed font-medium italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-[#1E293B]/10 mt-6">
                  <div className="w-10 h-10 rounded-full bg-[#FFFFFF] text-[#3674B5] flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                    {rev.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#1E293B] truncate">{rev.name}</h4>
                    <span className="text-[10px] font-bold text-[#3674B5] truncate block mt-0.5 uppercase tracking-wide">
                      Verified Purchase: {rev.product.replace("RAVTRON ", "")}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
