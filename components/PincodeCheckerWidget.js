"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Truck, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

let cachedPincodeData = null;

export default function PincodeCheckerWidget({ 
  className = "", 
  onStatusChange = null,
  highlightNeeded = false,
  requiredNotice = false
}) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    // Load saved pincode from localStorage if available
    const savedPin = localStorage.getItem("ravtron_user_pincode");
    if (savedPin && /^\d{6}$/.test(savedPin)) {
      setPincode(savedPin);
      checkPincodeDirect(savedPin);
    } else {
      if (onStatusChange) onStatusChange({ checked: false, available: false, pin: "" });
    }
  }, []);


  useEffect(() => {
    if (highlightNeeded && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightNeeded]);

  const getPincodeData = async () => {
    if (cachedPincodeData) return cachedPincodeData;
    try {
      const res = await fetch("/pincodes.json");
      if (res.ok) {
        cachedPincodeData = await res.json();
        return cachedPincodeData;
      }
    } catch (e) {
      console.error("Error loading pincode data:", e);
    }
    return null;
  };

  const checkPincodeDirect = async (cleanPin) => {
    setErrorMsg("");
    setLoading(true);

    try {
      const data = await getPincodeData();
      if (data && data[cleanPin] && data[cleanPin].length > 0) {
        const centerInfo = data[cleanPin][0];
        const resObj = {
          checked: true,
          available: true,
          pin: cleanPin,
          center: centerInfo.center,
          state: centerInfo.state,
          areas: centerInfo.areas || [],
        };
        setResult(resObj);
        localStorage.setItem("ravtron_user_pincode", cleanPin);
        if (onStatusChange) onStatusChange(resObj);
      } else {
        const resObj = {
          checked: true,
          available: false,
          pin: cleanPin,
        };
        setResult(resObj);
        localStorage.removeItem("ravtron_user_pincode");
        if (onStatusChange) onStatusChange(resObj);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to verify delivery for this pincode.");
      if (onStatusChange) onStatusChange({ checked: false, available: false, pin: cleanPin });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPin = pincode.trim().replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit postal pincode.");
      return;
    }
    checkPincodeDirect(cleanPin);
  };

  const handleReset = () => {
    setPincode("");
    setResult(null);
    setErrorMsg("");
    localStorage.removeItem("ravtron_user_pincode");
    if (onStatusChange) onStatusChange({ checked: false, available: false, pin: "" });
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div 
      className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-300 border ${
        highlightNeeded
          ? "bg-blue-50/40 border-[#3674B5] ring-2 ring-[#3674B5]/30"
          : "bg-[#F8FAFC] border-slate-200/90"
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#3674B5]" />
          <span className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
            Check Delivery Availability
          </span>
        </div>
        <Link 
          href="/pincode-checker" 
          className="text-[10px] font-bold text-[#3674B5] hover:underline flex items-center gap-0.5 transition-colors"
        >
          View Full Network
          <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPincode(val);
              if (errorMsg) setErrorMsg("");
              if (result && val !== result.pin) {
                setResult(null);
                if (onStatusChange) onStatusChange({ checked: false, available: false, pin: val });
              }
            }}
            placeholder="Enter your 6-digit Pincode..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 transition-all shadow-2xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="px-4 py-2.5 bg-[#1E293B] hover:bg-[#3674B5] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl transition-all shrink-0 flex items-center justify-center min-w-[76px] shadow-2xs cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : result ? "Re-check" : "Check"}
        </button>

        {result && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Change Pincode"
          >
            Change
          </button>
        )}
      </form>

      {errorMsg && (
        <p className="text-[11px] font-semibold text-rose-500 mt-2 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMsg}
        </p>
      )}

      {highlightNeeded && !result && (
        <p className="text-[11px] font-bold text-[#3674B5] mt-2 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#3674B5]" />
          Please enter your 6-digit delivery pincode to verify availability.
        </p>
      )}

      {result && result.available && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 text-xs animate-fade-in-up">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Delivery Available for <strong>{result.pin}</strong></span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {result.center || "Pan-India Express"}
          </span>
        </div>
      )}

      {result && !result.available && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs animate-fade-in-up">
          <div className="flex items-center gap-1.5 text-rose-600 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Delivery unavailable for <strong>{result.pin}</strong></span>
          </div>
          <Link 
            href="/pincode-checker" 
            className="text-[11px] font-bold text-[#3674B5] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View 2,700+ serviceable centers</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
