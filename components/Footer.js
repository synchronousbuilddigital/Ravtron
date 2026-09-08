"use client";

import React, { useState } from "react";
import { Zap, MessageCircle, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const shopLinks = [
    { name: "Cables", href: "/shop?category=Cables" },
    { name: "Converters", href: "/shop?category=Converters" },
    { name: "Docking Stations", href: "/shop?category=Docking Stations" },
    { name: "Webcams", href: "/shop?category=Accessories&search=Webcam" },
    { name: "Accessories", href: "/shop?category=Accessories" }
  ];

  const supportLinks = [
    { name: "Track Order", href: "/support?tab=track" },
    { name: "Returns & Exchanges", href: "/refund-policy" },
    { name: "Warranty Claim", href: "/support?tab=warranty" },
    { name: "Frequently Asked Questions", href: "/support?tab=faq" },
    { name: "Contact Support Team", href: "/support?tab=contact" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
    { name: "Shipping & Delivery Policy", href: "/shipping-policy" },
    { name: "Refund & Return Policy", href: "/refund-policy" }
  ];

  const socialLinks = [
    { name: "Instagram", href: "https://www.instagram.com/ksgapl/" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/ravtron/posts/?feedView=all" }
  ];

  const [openSections, setOpenSections] = useState({
    shop: false,
    support: false,
    legal: false,
    contact: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer className="bg-[#F8F9FA] border-t border-[#1E293B]/15 pt-8 pb-8 md:pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">

        {/* Main Footer Links Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-6">

          {/* Brand Info Column */}
          <div className="space-y-4 sm:col-span-2 md:col-span-3 lg:col-span-3 xl:col-span-3 border-b border-[#1E293B]/10 lg:border-0 pb-6 lg:pb-0">
            <Link href="/" className="flex items-center group">
              <img 
                src="/logo.png" 
                alt="RAVTRON®" 
                className="h-8 sm:h-9 w-auto object-contain mix-blend-multiply transition-all duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm font-semibold text-[#1E293B]/60 leading-relaxed max-w-sm">
              RAVTRON® is a trusted leader in IT, networking, display cabling, high-speed power adapters, surveillance solutions, and smart workspace products—exploring ways to connectivity.
            </p>
            <div className="flex items-center gap-3.5 pt-2">
              {socialLinks.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-95 ${
                    soc.name === "Instagram"
                      ? "bg-gradient-to-tr from-[#F9CE34] via-[#EE2A7B] to-[#6228D7] text-white hover:shadow-pink-500/30"
                      : "bg-[#0A66C2] hover:bg-[#004182] text-white hover:shadow-blue-500/30"
                  }`}
                  aria-label={soc.name}
                >
                  {soc.name === "Instagram" && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  )}
                  {soc.name === "LinkedIn" && (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-0 lg:space-y-4 border-b border-[#1E293B]/10 lg:border-0 pb-2 lg:pb-0 sm:col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2">
            <button
              onClick={() => toggleSection("shop")}
              className="w-full flex items-center justify-between py-3 text-left lg:pointer-events-none lg:py-0 focus:outline-none"
            >
              <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-widest">Shop Gear</h4>
              <span className="lg:hidden text-[#1E293B]/50">
                {openSections.shop ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>
            <ul className={`${openSections.shop ? "block" : "hidden"} lg:block space-y-2.5 mt-1 lg:mt-4 pb-4 lg:pb-0`}>
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-[#1E293B]/60 hover:text-[#3674B5] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-0 lg:space-y-4 border-b border-[#1E293B]/10 lg:border-0 pb-2 lg:pb-0 sm:col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2">
            <button
              onClick={() => toggleSection("support")}
              className="w-full flex items-center justify-between py-3 text-left lg:pointer-events-none lg:py-0 focus:outline-none"
            >
              <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-widest">Customer Care</h4>
              <span className="lg:hidden text-[#1E293B]/50">
                {openSections.support ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>
            <ul className={`${openSections.support ? "block" : "hidden"} lg:block space-y-2.5 mt-1 lg:mt-4 pb-4 lg:pb-0`}>
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-[#1E293B]/60 hover:text-[#3674B5] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Policies Column */}
          <div className="space-y-0 lg:space-y-4 border-b border-[#1E293B]/10 lg:border-0 pb-2 lg:pb-0 sm:col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2">
            <button
              onClick={() => toggleSection("legal")}
              className="w-full flex items-center justify-between py-3 text-left lg:pointer-events-none lg:py-0 focus:outline-none"
            >
              <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-widest">Legal Policies</h4>
              <span className="lg:hidden text-[#1E293B]/50">
                {openSections.legal ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>
            <ul className={`${openSections.legal ? "block" : "hidden"} lg:block space-y-2.5 mt-1 lg:mt-4 pb-4 lg:pb-0`}>
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-[#1E293B]/60 hover:text-[#3674B5] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Contact Column */}
          <div className="space-y-0 lg:space-y-4 pb-2 lg:pb-0 min-w-0 sm:col-span-2 md:col-span-1 lg:col-span-3 xl:col-span-3">
            <button
              onClick={() => toggleSection("contact")}
              className="w-full flex items-center justify-between py-3 text-left lg:pointer-events-none lg:py-0 focus:outline-none"
            >
              <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-widest">Contact Details</h4>
              <span className="lg:hidden text-[#1E293B]/50">
                {openSections.contact ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>
            <ul className={`${openSections.contact ? "block" : "hidden"} lg:block space-y-3.5 mt-2 lg:mt-4 pb-4 lg:pb-0 text-sm font-semibold text-[#1E293B]/70 min-w-0`}>
              <li className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-[#1E293B]/40 uppercase tracking-wide">Write to Us</span>
                <a 
                  href="mailto:officerequirementsgurgaon@gmail.com" 
                  className="hover:text-[#3674B5] transition-colors mt-0.5 whitespace-nowrap text-[11px] sm:text-xs md:text-xs xl:text-sm font-semibold leading-snug block"
                  title="officerequirementsgurgaon@gmail.com"
                >
                  officerequirementsgurgaon@gmail.com
                </a>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-[#1E293B]/40 uppercase tracking-wide">Call Support</span>
                <a href="tel:01244111620" className="hover:text-[#3674B5] transition-colors mt-0.5">
                  0124 4111620
                </a>
              </li>
              <li className="flex items-center gap-1.5 pt-1">
                <a
                  href="https://wa.me/911244111620"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#3674B5] text-white text-[10px] font-extrabold uppercase tracking-wide hover:bg-[#3674B5] transition-all flex items-center gap-1.5 hover:scale-103"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Chat</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and payment gateway strip */}
        <div className="pt-8 border-t border-[#1E293B]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-[#1E293B]/50 text-center sm:text-left">
            © {new Date().getFullYear()} RAVTRON India. All rights reserved. Made for premium workspace aesthetics.
          </p>

          {/* Payment gateway icons */}
          <div className="flex items-center gap-2 flex-wrap">
            {["Visa", "Mastercard", "UPI Pay", "Razorpay", "NetBanking"].map((pay) => (
              <span
                key={pay}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFFFFF] border border-[#1E293B]/10 text-[9px] font-extrabold text-[#1E293B]/50 uppercase tracking-wider"
              >
                <CreditCard className="w-3 h-3" />
                <span>{pay}</span>
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
