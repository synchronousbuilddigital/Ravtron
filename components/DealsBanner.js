"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function DealsBanner() {
  // Real-time ticking countdown timer (e.g. starting at 2 hours, 14 minutes, 37 seconds)
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 14 * 60 + 37);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return {
      hours: hrs.toString().padStart(2, "0"),
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <section id="deals" className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-[#F8F9FA] border border-[#1E293B]/10 p-8 sm:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
        
        {/* Decorative background lights */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#E5D0C6] opacity-40 blur-3xl pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#E8EFE5] opacity-30 blur-3xl pointer-events-none z-0"></div>

        {/* Content Column */}
        <div className="relative z-10 flex-1 max-w-xl text-left space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
            <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
              Flash Deal of the Month
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1E293B] tracking-tight leading-[1.1]">
            Up to 40% Off on Bestsellers
          </h2>
          <p className="text-sm font-semibold text-[#1E293B]/60 leading-relaxed">
            Upgrade your portable workstation with premium docking stations, 4K video converters, and heavy-duty display cables. Offer valid while stocks last.
          </p>
          <div className="pt-2">
            <a
              href="#store"
              className="inline-block px-7 py-3.5 rounded-full bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-bold transition-all hover:scale-105"
            >
              Shop the Sale
            </a>
          </div>
        </div>

        {/* Ticking Countdown Column */}
        <div className="relative z-10 w-full lg:w-auto flex flex-col items-center lg:items-end justify-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1E293B]/40 uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" />
            <span>Limited Time Remaining</span>
          </span>

          <div className="flex items-center gap-3">
            {/* Hours Block */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white border border-[#1E293B]/10 flex items-center justify-center shadow-sm">
                <span className="font-display font-black text-2xl sm:text-3xl text-[#1E293B]">
                  {hours}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#1E293B]/40 uppercase mt-2">Hours</span>
            </div>

            <span className="font-display font-black text-2xl text-[#1E293B] -mt-6">:</span>

            {/* Minutes Block */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white border border-[#1E293B]/10 flex items-center justify-center shadow-sm">
                <span className="font-display font-black text-2xl sm:text-3xl text-[#1E293B]">
                  {minutes}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#1E293B]/40 uppercase mt-2">Mins</span>
            </div>

            <span className="font-display font-black text-2xl text-[#1E293B] -mt-6">:</span>

            {/* Seconds Block */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white border border-[#1E293B]/10 flex items-center justify-center shadow-sm">
                <span className="font-display font-black text-2xl sm:text-3xl text-[#3674B5] animate-pulse">
                  {seconds}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#1E293B]/40 uppercase mt-2">Secs</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
