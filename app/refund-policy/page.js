"use client";

import React from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import { 
  ShieldCheck, 
  CreditCard, 
  ChevronRight,
  Clock,
  PackageX,
  XCircle,
  Check
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
          <span className="text-slate-700 font-bold">No Return & Refund Policy</span>
        </nav>

        {/* Header Section */}
        <div className="space-y-4 max-w-3xl text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Store Policy Notice
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#1E293B] tracking-tight leading-tight">
            No Return & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3674B5] to-[#578FCA]">Refund Policy</span>
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
            Thank you for shopping at RAVTRON®. Please review our order cancellation, refund, and product protection policies outlined below.
          </p>
        </div>

        {/* Key Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-rose-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <PackageX className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">No Returns & No Exchanges</h3>
            <p className="text-xs text-slate-500 font-medium">Once an order is shipped and delivered, we do not accept product returns or size/model exchanges.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3674B5] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">24-Hour Cancellation Window</h3>
            <p className="text-xs text-slate-500 font-medium">Orders can be cancelled with a 100% full refund within 24 hours of placement directly from your Profile.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">1-Year Warranty Coverage</h3>
            <p className="text-xs text-slate-500 font-medium">All genuine RAVTRON® hardware is protected by a 1-Year Limited Manufacturer Warranty.</p>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-8 text-left max-w-4xl mx-auto">

          {/* Section 1: No Return & No Exchange Policy */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
            <h3 className="font-display font-black text-lg text-[#1E293B] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              <span>1. Strict No Return & No Exchange Policy</span>
            </h3>
            <div className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed space-y-2">
              <p>
                At RAVTRON®, every item undergoes thorough multi-stage electrical and physical quality inspection prior to packaging and dispatch to guarantee zero-defect standards. 
              </p>
              <div className="p-4 bg-rose-50/60 border border-rose-200/60 rounded-2xl space-y-1.5 text-xs text-rose-900 font-semibold">
                <p>• All sales are final upon delivery. We do not accept returns or exchange requests under any circumstances for delivered goods.</p>
                <p>• We do not provide exchanges for different lengths, colors, ports, or compatibility mismatches once shipped. Please verify specifications before placing your order.</p>
                <p>• Used, opened, or unpacked accessories cannot be returned or refunded.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Order Cancellation & Refund Eligibility */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
            <h3 className="font-display font-black text-lg text-[#1E293B] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#3674B5]" />
              <span>2. 24-Hour Order Cancellation & Full Refund</span>
            </h3>
            <div className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed space-y-2">
              <p>
                You can cancel your order at <strong>zero cancellation fee</strong> within <strong>24 hours of placing the order</strong>.
              </p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>How to Cancel:</strong> Navigate to your <em>Profile &gt; Order History</em> and click the <strong>Cancel</strong> button on your order within 24 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Refund Processing:</strong> Once cancelled, a 100% full refund is immediately initiated back to your original payment method (Bank Card, UPI, or NetBanking).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Credit Timelines:</strong> UPI and direct transfers reflect in 24–48 hours; Credit/Debit cards typically credit within 5–7 business days according to your bank's policies.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: 1-Year Product Warranty Protection */}
          <div className="bg-gradient-to-br from-[#3674B5]/5 via-[#F8F9FA] to-white border border-[#3674B5]/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#3674B5]" />
              <div>
                <h3 className="font-display font-black text-lg text-[#1E293B]">3. 1-Year Product Warranty Support</h3>
                <p className="text-xs text-slate-500 font-semibold">Reliable manufacturer protection against functional defects.</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              While we do not offer general returns or exchanges, your purchase is completely safeguarded by our <strong>1-Year Limited Manufacturer Warranty</strong>. If an item exhibits any internal hardware defects during regular usage, our support team will repair or replace it under warranty terms.
            </p>
            <div className="pt-1">
              <Link 
                href="/support?tab=warranty" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3674B5] text-white text-xs font-extrabold uppercase tracking-wide hover:bg-[#578FCA] transition-all"
              >
                <span>Go to Warranty Claims Center</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}
