"use client";

import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Browse & Pick Your Product",
      description: "Find the precise display cables, docking stations, converters, and networking gear engineered for your workspace."
    },
    {
      num: "02",
      title: "Add to Cart & Checkout Securely",
      description: "Complete your transaction with instant UPI, Razorpay, or credit card processing protected by bank-grade encryption."
    },
    {
      num: "03",
      title: "Fast Delivery to Your Door",
      description: "Unbox your device within 48 hours. Every delivery is packed with eco-conscious custom mailer cards."
    }
  ];

  return (
    <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
            <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
              Effortless Logistics
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1E293B] tracking-tight">
            Order in 3 Simple Steps
          </h2>
          <p className="text-sm font-semibold text-[#1E293B]/50">
            Getting premium connectivity products has never been more straightforward or secure.
          </p>
        </div>

        {/* Steps Grid - Desktop View */}
        <div className="hidden md:grid md:grid-cols-3 gap-12 lg:gap-16 relative">
          
          {/* Connector Line on Desktop */}
          <div className="absolute top-12 left-[15%] right-[15%] h-[1px] bg-[#3674B5]/10 z-0"></div>

          {steps.map((step) => (
            <div key={step.num} className="relative z-10 flex flex-col items-center text-center space-y-4">
              
              {/* Number Circle Badge */}
              <div className="w-20 h-20 rounded-full bg-[#F8F9FA] border border-white flex items-center justify-center shadow-sm">
                <span className="font-display font-black text-xl text-[#3674B5]">
                  {step.num}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-lg text-[#1E293B] pt-2">
                {step.title}
              </h3>
              <p className="text-sm text-[#1E293B]/60 leading-relaxed max-w-xs font-medium">
                {step.description}
              </p>

            </div>
          ))}
        </div>

        {/* Mobile View - Vertical Steps Timeline */}
        <div className="md:hidden relative pl-6 space-y-8">
          {/* Vertical Connector Line */}
          <div className="absolute top-3 bottom-3 left-[15px] w-[2px] bg-[#3674B5]/15 z-0"></div>

          {steps.map((step) => (
            <div key={step.num} className="relative z-10 flex items-start gap-4 text-left">
              
              {/* Number Circle Badge */}
              <div className="w-8 h-8 rounded-full bg-[#F8F9FA] border border-white flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="font-display font-black text-xs text-[#3674B5]">
                  {step.num}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#1E293B]">
                  {step.title}
                </h3>
                <p className="text-xs text-[#1E293B]/60 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
