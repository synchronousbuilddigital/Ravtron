"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import { 
  Truck, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  PackageCheck, 
  AlertCircle, 
  ArrowRight,
  Search,
  ChevronRight,
  Sparkles,
  Check
} from "lucide-react";

export default function ShippingPolicyPage() {
  // Interactive Pincode Estimator State
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length !== 6) {
      setPincodeResult({ error: "Please enter a valid 6-digit Indian Pincode." });
      return;
    }

    setIsCheckingPincode(true);
    setPincodeResult(null);

    // Simulate delivery pincode lookup
    setTimeout(() => {
      setIsCheckingPincode(false);
      const codeNum = parseInt(pincode.trim(), 10);
      
      // Metro check sample logic (1100xx Delhi, 4000xx Mumbai, 5600xx Blr, 7000xx Kol, 6000xx Chn)
      const firstTwo = Math.floor(codeNum / 10000);
      let isMetro = [11, 40, 56, 70, 60, 50, 41, 12, 20].includes(firstTwo);

      if (isMetro) {
        setPincodeResult({
          serviceable: true,
          type: "Metro Express Zone",
          estimatedDays: "2 - 3 Business Days",
          expressAvailable: true,
          courier: "Delhivery / BlueDart Express"
        });
      } else {
        setPincodeResult({
          serviceable: true,
          type: "Standard Pan-India Zone",
          estimatedDays: "4 - 6 Business Days",
          expressAvailable: false,
          courier: "Surface Air Parcel"
        });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#334155] antialiased selection:bg-[#3674B5] selection:text-white">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 md:pt-14 pb-20 md:pb-28 space-y-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-[#3674B5] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-700 font-bold">Shipping & Delivery Policy</span>
        </nav>

        {/* Header Section */}
        <div className="space-y-4 max-w-3xl text-left">
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#1E293B] tracking-tight leading-tight">
            Shipping & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3674B5] to-[#578FCA]">Delivery Policy</span>
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
            We ensure fast, reliable, and secure delivery for all RAVTRON® products across India. Learn about our dispatch timelines, free shipping thresholds, and tracking processes.
          </p>
        </div>

        {/* Shipping Key Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3674B5] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Free Delivery Above ₹300</h3>
            <p className="text-xs text-slate-500 font-medium">Complimentary shipping on orders ₹300 and above. Delivery fee of ₹99 for orders under ₹300.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Same-Day Dispatch</h3>
            <p className="text-xs text-slate-500 font-medium">Orders confirmed before 2:00 PM IST on business days are packed and dispatched the same day.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">2–4 Day Metro Express</h3>
            <p className="text-xs text-slate-500 font-medium">Rapid air delivery to major metropolitan hubs (Delhi NCR, Mumbai, Bangalore, Hyderabad, Kolkata, Chennai).</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Live Order Tracking</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time SMS & email tracking updates with milestone step details for every parcel.</p>
          </div>
        </div>

        {/* Interactive Pincode Delivery Estimator Widget */}
        <div className="bg-gradient-to-r from-slate-900 to-[#1E293B] text-white rounded-3xl p-6 sm:p-10 shadow-md space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#3674B5]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3674B5]/20 border border-[#3674B5]/40 text-[#D0ECFC]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Live Delivery Lookup</span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white">
              Check Delivery Timelines For Your Pincode
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Enter your 6-digit destination pincode to verify estimated delivery days and courier carrier partners.
            </p>
          </div>

          <form onSubmit={handlePincodeCheck} className="relative z-10 max-w-md flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode (e.g. 110001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-slate-400 outline-none focus:border-[#3674B5] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isCheckingPincode}
              className="px-6 py-3 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCheckingPincode ? "Checking..." : "Check Timeline"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Pincode Lookup Result Card */}
          {pincodeResult && (
            <div className="relative z-10 max-w-md animate-fade-in text-left">
              {pincodeResult.error ? (
                <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{pincodeResult.error}</span>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded">
                      {pincodeResult.type}
                    </span>
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Serviceable
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300">Estimated Delivery Time:</p>
                    <p className="text-base font-black text-white">{pincodeResult.estimatedDays}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Assigned Carrier: {pincodeResult.courier}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detailed Shipping Clauses */}
        <div className="space-y-8 text-left max-w-4xl mx-auto">
          
          {/* Clause 1: Dispatch & Processing */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
            <h3 className="font-display font-black text-lg text-[#1E293B] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#3674B5]" />
              <span>1. Order Processing & Dispatch Timelines</span>
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              Orders placed before <strong>2:00 PM IST</strong> on Monday through Saturday are dispatched on the same business day. Orders received after 2:00 PM IST or on Sundays and national holidays will be processed on the next operating business day.
            </p>
          </div>

          {/* Clause 2: Rates & Thresholds */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
            <h3 className="font-display font-black text-lg text-[#1E293B] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#3674B5]" />
              <span>2. Shipping Rates & Free Shipping Eligibility</span>
            </h3>
            <div className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed space-y-2">
              <p>
                We offer free standard shipping on all cart totals amounting to <strong>₹300 or more</strong>. For cart values under ₹300, a delivery charge of ₹99 is added at checkout.
              </p>
              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-700">
                • Free Shipping: Orders ₹300+ (Zero delivery fee)<br />
                • Standard Shipping: Orders under ₹300 (Flat ₹99 fee)
              </div>
            </div>
          </div>

          {/* Clause 3: Tracking & Delivery */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
            <h3 className="font-display font-black text-lg text-[#1E293B] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#3674B5]" />
              <span>3. Order Tracking & Delivery Inspection</span>
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              Once dispatched, an automated tracking link is sent to your registered email and mobile number. You can also track shipment status anytime using our native tracker at{" "}
              <Link href="/support?tab=track" className="text-[#3674B5] font-bold hover:underline">
                Support Order Tracker
              </Link>.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Upon Delivery:</strong> Please inspect the external package box before signing. If the outer tamper-evident tape is broken or damaged, please take a photograph and reject the delivery immediately before reporting to our support team.
            </p>
          </div>

        </div>

      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}
