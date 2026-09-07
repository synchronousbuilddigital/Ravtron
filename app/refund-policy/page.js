"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import { 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  CreditCard, 
  ArrowRight,
  ChevronRight,
  Clock,
  HelpCircle,
  FileText,
  Check,
  PackageX,
  RotateCcw
} from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#334155] antialiased selection:bg-[#3674B5] selection:text-white">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 md:pt-14 pb-20 md:pb-28 space-y-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-[#3674B5] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-700 font-bold">Refund & Return Policy</span>
        </nav>

        {/* Header Section */}
        <div className="space-y-4 max-w-3xl text-left">
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#1E293B] tracking-tight leading-tight">
            Refund & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3674B5] to-[#578FCA]">Return Policy</span>
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
            We take pride in building premium quality RAVTRON® products. If you receive a defective item or transit-damaged shipment, we offer a transparent 7-day return and 1-year product warranty replacement service.
          </p>
        </div>

        {/* Key Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3674B5] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">7-Day Return Window</h3>
            <p className="text-xs text-slate-500 font-medium">Full replacement or refund for manufacturing defects or transit damages within 7 days of delivery.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Free Doorstep Pickup</h3>
            <p className="text-xs text-slate-500 font-medium">Complimentary reverse courier pickup from your address with zero extra shipping charges.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">5–7 Day Bank Refund</h3>
            <p className="text-xs text-slate-500 font-medium">Approved refunds are processed within 24-48 hours of inspection and credited to your original payment mode.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">1-Year Product Warranty</h3>
            <p className="text-xs text-slate-500 font-medium">Long-term protection backed by 1-year replacement support for all genuine products.</p>
          </div>
        </div>

        {/* Visual Return Flow Steps */}
        <div className="bg-[#F8F9FA] border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-widest bg-[#3674B5]/10 px-2.5 py-1 rounded-full border border-[#3674B5]/20">
              Simple 4-Step Process
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#1E293B] pt-1">
              How The Return & Refund Flow Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {[
              {
                step: "01",
                title: "Submit Return Request",
                desc: "Contact support or submit a ticket under Customer Care within 7 days of receiving your parcel."
              },
              {
                step: "02",
                title: "Verification & Pickup",
                desc: "Our team verifies details and schedules a free reverse courier pickup from your doorstep."
              },
              {
                step: "03",
                title: "Quality Inspection",
                desc: "Item arrives at our facility and undergoes technical quality inspection within 24 to 48 hours."
              },
              {
                step: "04",
                title: "Refund or Replacement",
                desc: "Fresh replacement unit is shipped or full refund is initiated to your bank / UPI account."
              }
            ].map((s, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/70 space-y-2 relative shadow-2xs">
                <span className="font-display font-black text-2xl text-[#3674B5]/40">{s.step}</span>
                <h4 className="font-extrabold text-slate-900 text-sm">{s.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-8 text-left max-w-4xl mx-auto">

          {/* Section 1: Return Eligibility */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
            <h3 className="font-display font-black text-lg text-[#1E293B] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>1. Return & Replacement Eligibility</span>
            </h3>
            <div className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed space-y-2">
              <p>
                Products are eligible for return or replacement within 7 calendar days of delivery under the following conditions:
              </p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Defective or DOA:</strong> Product is non-functional upon arrival or exhibits manufacturing defects.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Transit Damage:</strong> Parcel box or internal contents arrived physically broken during courier transport.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Incorrect Product:</strong> Delivered item differs from the product ordered on invoice.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Non-Returnable Scenarios */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
            <h3 className="font-display font-black text-lg text-[#1E293B] flex items-center gap-2">
              <PackageX className="w-5 h-5 text-rose-500" />
              <span>2. Non-Returnable Scenarios</span>
            </h3>
            <div className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed space-y-2">
              <p>Returns cannot be accepted under the following conditions:</p>
              <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-1.5 text-xs text-rose-900 font-semibold">
                <p>• Returns requested after 7 days from the confirmed delivery date.</p>
                <p>• Physical damage caused by customer misuse, accidental drops, or liquid spills.</p>
                <p>• Products returned without original packaging boxes, serial numbers, or cables.</p>
                <p>• Unauthorized repair attempts or tampered internal seals.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Refund Timelines & Bank Credit */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
            <h3 className="font-display font-black text-lg text-[#1E293B] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#3674B5]" />
              <span>3. Refund Execution & Bank Credit Timelines</span>
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              Once your returned package is inspected at our warehouse, refunds are approved within 24 to 48 hours. The credited funds will reflect in your account based on your original payment method:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-slate-200/60 text-xs">
                <p className="font-extrabold text-slate-900">Prepaid Orders (Cards / NetBanking / Wallets)</p>
                <p className="text-slate-500 mt-0.5">Refunded directly to original payment source in 5 - 7 business days.</p>
              </div>
              <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-slate-200/60 text-xs">
                <p className="font-extrabold text-slate-900">UPI Payments & Direct Transfers</p>
                <p className="text-slate-500 mt-0.5">Refunded via instant UPI payout or IMPS transfer in 24 - 48 hours.</p>
              </div>
            </div>
          </div>

          {/* Section 4: 1-Year Product Warranty */}
          <div className="bg-gradient-to-br from-[#3674B5]/5 via-[#F8F9FA] to-white border border-[#3674B5]/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#3674B5]" />
              <div>
                <h3 className="font-display font-black text-lg text-[#1E293B]">4. 1-Year Product Warranty Replacement</h3>
                <p className="text-xs text-slate-500 font-semibold">Long-term coverage beyond the 7-day initial return period.</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              After the initial 7-day return window, all genuine RAVTRON® products remain covered by our <strong>1-Year Limited Product Replacement Warranty</strong> for functional or technical failures. You can file replacement claims anytime under our{" "}
              <Link href="/support?tab=warranty" className="text-[#3674B5] font-bold hover:underline">
                Warranty Claims Center
              </Link>.
            </p>
          </div>

        </div>

      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}
