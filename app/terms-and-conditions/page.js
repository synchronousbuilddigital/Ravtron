"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import { 
  Scale, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  CreditCard, 
  Zap,
  BookOpen,
  Gavel,
  Check
} from "lucide-react";

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const navItems = [
    { id: "acceptance", label: "1. Agreement Acceptance" },
    { id: "products", label: "2. Product Specs & Guidelines" },
    { id: "pricing", label: "3. Pricing & Order Acceptance" },
    { id: "payments", label: "4. Payments & Billing" },
    { id: "ip", label: "5. Intellectual Property" },
    { id: "liability", label: "6. Limitation of Liability" },
    { id: "governing", label: "7. Governing Law" }
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#334155] antialiased selection:bg-[#3674B5] selection:text-white">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 md:pt-14 pb-20 md:pb-28">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href="/" className="hover:text-[#3674B5] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-700 font-bold">Terms & Conditions</span>
        </nav>

        {/* Header Section */}
        <div className="space-y-4 max-w-3xl mb-10 text-left">
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#1E293B] tracking-tight leading-tight">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3674B5] to-[#578FCA]">Conditions</span>
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
            These Terms & Conditions govern your access to and use of the RAVTRON® platform (operated by KSG Automation Pvt. Ltd.), including all online purchases, product items, and user customer services.
          </p>
        </div>

        {/* Content Layout with Side Anchors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Quick Nav Sidebar (Desktop Sticky) */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-28 bg-[#F8F9FA] border border-slate-200/70 rounded-2xl p-4 space-y-2 shadow-2xs">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 pt-1">
                Terms Navigation
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSection === item.id
                        ? "bg-[#3674B5] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-200/80 px-3">
                <p className="text-[11px] font-semibold text-slate-500">Legal inquiries?</p>
                <a href="mailto:officerequirementsgurgaon@gmail.com" className="text-xs font-bold text-[#3674B5] hover:underline">
                  officerequirementsgurgaon@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Main Legal Content */}
          <div className="lg:col-span-9 space-y-10 text-left">

            {/* Section 1: Agreement Acceptance */}
            <section id="acceptance" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs hover:border-[#3674B5]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3674B5]/10 border border-[#3674B5]/20 flex items-center justify-center text-[#3674B5]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-[#1E293B]">1. Agreement & User Account Terms</h2>
                  <p className="text-xs text-slate-400 font-semibold">Conditions for using the store and creating accounts.</p>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 space-y-3 pt-2 border-t border-slate-100">
                <p>
                  By accessing, browsing, or completing a purchase on RAVTRON®, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-slate-200/60 space-y-1">
                    <h4 className="font-extrabold text-[#1E293B] text-xs">Account Accuracy</h4>
                    <p className="text-xs text-slate-500">You must provide true, current, and complete personal and shipping contact information when creating an account or checking out.</p>
                  </div>
                  <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-slate-200/60 space-y-1">
                    <h4 className="font-extrabold text-[#1E293B] text-xs">Account Security</h4>
                    <p className="text-xs text-slate-500">You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Product Specs & Guidelines */}
            <section id="products" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs hover:border-[#3674B5]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-[#1E293B]">2. Product Specifications & Guidelines</h2>
                  <p className="text-xs text-slate-400 font-semibold">Usage conditions for power adapters, cabling, and workspace products.</p>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 space-y-3 pt-2 border-t border-slate-100">
                <p>
                  All RAVTRON® products (cables, adapters, converters, docking stations) are engineered to high performance standards.
                </p>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900">Recommended Operating Parameters</h4>
                  <ul className="space-y-1.5 text-xs text-amber-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Always use products within designated voltage and power specifications printed on product boxes.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Avoid exposing electronic products to liquid moisture, extreme heat, or severe mechanical stress.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Pricing & Order Acceptance */}
            <section id="pricing" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs hover:border-[#3674B5]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-[#1E293B]">3. Pricing, Discounts & Order Acceptance</h2>
                  <p className="text-xs text-slate-400 font-semibold">Terms regarding INR pricing, tax inclusions, and confirmation.</p>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 space-y-3 pt-2 border-t border-slate-100">
                <p>
                  All prices listed on the website are in Indian Rupees (INR ₹) and include applicable GST taxes unless stated otherwise.
                </p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3674B5] shrink-0 mt-0.5" />
                    <span><strong>Order Confirmation vs Acceptance:</strong> Receipt of an order confirmation email indicates we received your order request; final acceptance occurs when products are dispatched.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3674B5] shrink-0 mt-0.5" />
                    <span><strong>Typographical Errors:</strong> In the rare event a product is listed at an incorrect price due to a system error, RAVTRON® reserves the right to cancel or refund affected orders.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4: Payments & Billing */}
            <section id="payments" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs hover:border-[#3674B5]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-[#1E293B]">4. Payments & Fraud Prevention</h2>
                  <p className="text-xs text-slate-400 font-semibold">Accepted payment methods and fraud verification protocols.</p>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 space-y-3 pt-2 border-t border-slate-100">
                <p>
                  We accept major Credit/Debit Cards, UPI, NetBanking, and authorized e-wallets. Orders are processed upon successful payment authorization from your issuing financial institution.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-600">
                    To prevent fraudulent activities, transactions flagged as suspicious by our automated fraud detection filters may require additional verification or cancellation prior to fulfillment.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Intellectual Property */}
            <section id="ip" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs hover:border-[#3674B5]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-[#1E293B]">5. Intellectual Property Rights</h2>
                  <p className="text-xs text-slate-400 font-semibold">Trademarks, product designs, and content ownership.</p>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 space-y-3 pt-2 border-t border-slate-100">
                <p>
                  All content, product photography, logos, brand names (RAVTRON®), user interface designs, and codebase on this site are the exclusive intellectual property of KSG Automation Pvt. Ltd.
                </p>
                <p className="text-xs text-slate-500">
                  Unauthorized reproduction, copying, or commercial distribution of platform materials without explicit written consent is strictly prohibited under Indian Copyright laws.
                </p>
              </div>
            </section>

            {/* Section 6: Limitation of Liability */}
            <section id="liability" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs hover:border-[#3674B5]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-[#1E293B]">6. Limitation of Liability & Warranty Scope</h2>
                  <p className="text-xs text-slate-400 font-semibold">Extent of liability and product warranty replacement limits.</p>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 space-y-3 pt-2 border-t border-slate-100">
                <p>
                  RAVTRON® products are covered under a <strong>1-Year Limited Product Replacement Warranty</strong> against manufacturing defects as detailed in our Warranty Policy.
                </p>
                <p className="text-xs text-slate-500">
                  To the maximum extent permitted by applicable law, KSG Automation Pvt. Ltd. shall not be liable for any indirect, incidental, or consequential damages resulting from product misuse, improper power source connection, or unauthorized modifications.
                </p>
              </div>
            </section>

            {/* Section 7: Governing Law */}
            <section id="governing" className="bg-[#F8F9FA] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1E293B] text-white flex items-center justify-center">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-[#1E293B]">7. Governing Law & Legal Jurisdiction</h2>
                  <p className="text-xs text-slate-400 font-semibold">Jurisdiction for resolving legal disputes.</p>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600 space-y-2 pt-2 border-t border-slate-200">
                <p>
                  These Terms & Conditions are governed by and construed in accordance with the laws of India.
                </p>
                <p className="text-xs text-slate-500">
                  Any disputes or claims arising from the use of this website or purchases made hereunder shall be subject to the exclusive jurisdiction of the competent courts in Gurgaon, Haryana, India.
                </p>
              </div>
            </section>

          </div>
        </div>

      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}
