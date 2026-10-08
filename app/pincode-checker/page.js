"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import { 
  MapPin, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Truck, 
  Globe, 
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";

export default function PincodeCheckerPage() {
  const [pincodeData, setPincodeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    fetch("/pincodes.json")
      .then((res) => res.json())
      .then((data) => {
        setPincodeData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load pincode database:", err);
        setLoading(false);
      });
  }, []);

  // Compute all states and totals
  const { statesList, totalPincodes, totalCenters } = useMemo(() => {
    const states = new Set();
    const centers = new Set();
    const pinKeys = Object.keys(pincodeData);

    pinKeys.forEach((pin) => {
      pincodeData[pin].forEach((item) => {
        if (item.state) states.add(item.state);
        if (item.center) centers.add(item.center);
      });
    });

    return {
      statesList: Array.from(states).sort(),
      totalPincodes: pinKeys.length,
      totalCenters: centers.size,
    };
  }, [pincodeData]);

  // Search logic
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toUpperCase();
    if (!q && !selectedState) return null;

    const isExactPin = /^\d{6}$/.test(q);

    if (isExactPin) {
      if (pincodeData[q]) {
        return {
          isExact: true,
          query: q,
          available: true,
          items: pincodeData[q].map((c) => ({ ...c, pincode: q })),
        };
      } else {
        return {
          isExact: true,
          query: q,
          available: false,
          items: [],
        };
      }
    }

    const matches = [];
    const keys = Object.keys(pincodeData);

    for (const pin of keys) {
      const centers = pincodeData[pin];
      for (const c of centers) {
        if (selectedState && c.state !== selectedState) continue;

        const pinMatch = pin.includes(q);
        const centerMatch = c.center && c.center.toUpperCase().includes(q);
        const stateMatch = c.state && c.state.toUpperCase().includes(q);
        const areaMatch =
          c.areas && c.areas.some((a) => a.toUpperCase().includes(q));

        if (!q || pinMatch || centerMatch || stateMatch || areaMatch) {
          matches.push({ ...c, pincode: pin });
        }
      }
    }

    return {
      isExact: false,
      query: q || selectedState,
      available: matches.length > 0,
      items: matches,
    };
  }, [searchTerm, selectedState, pincodeData]);

  const popularPincodes = [
    { pin: "110001", city: "New Delhi" },
    { pin: "400001", city: "Mumbai" },
    { pin: "560001", city: "Bengaluru" },
    { pin: "380001", city: "Ahmedabad" },
    { pin: "411001", city: "Pune" },
    { pin: "700001", city: "Kolkata" },
    { pin: "500001", city: "Hyderabad" },
    { pin: "600001", city: "Chennai" },
  ];

  return (
    <div className="min-h-screen bg-bg-brand text-text-brand antialiased selection:bg-[#3674B5] selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Nationwide Logistics Network
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Pincode Delivery{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500">
              Coverage Checker
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
            Verify real-time delivery coverage and find serviceable delivery centers
            and landmarks across India.
          </p>
        </div>

        {/* Live Network Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-5 shadow-sm backdrop-blur-md text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {loading ? "..." : totalPincodes.toLocaleString("en-IN")}
            </div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              Serviceable Pincodes
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-5 shadow-sm backdrop-blur-md text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {loading ? "..." : totalCenters.toLocaleString("en-IN")}
            </div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              Delivery Hubs & Centers
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-5 shadow-sm backdrop-blur-md text-center">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {loading ? "..." : statesList.length}
            </div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              States & Territories
            </div>
          </div>
        </div>

        {/* Search & Filter Control Box */}
        <div className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/80 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter 6-digit Pincode, City, or Center name (e.g. 110001, Ahmedabad)..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-3.5 bg-gray-50 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="">All States / UTs</option>
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {(searchTerm || selectedState) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedState("");
                }}
                className="px-5 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl font-semibold text-gray-700 dark:text-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {/* Quick Pincode Suggestions */}
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Quick Check:
            </span>
            {popularPincodes.map((item) => (
              <button
                key={item.pin}
                onClick={() => setSearchTerm(item.pin)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700/60 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/40 dark:hover:text-blue-400 text-gray-600 dark:text-gray-300 border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                {item.pin} · {item.city}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Display */}
        <div>
          {searchResults === null ? (
            <div className="bg-white/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Enter a Pincode to Check Availability
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Type any Indian postal code or search by city name to see live
                fulfillment center status and serviced landmarks.
              </p>
            </div>
          ) : !searchResults.available ? (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-950 dark:text-red-200">
                    {searchResults.isExact
                      ? `Pincode ${searchResults.query} is Currently Non-Serviceable`
                      : `No Delivery Centers Found Matching "${searchResults.query}"`}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Standard courier direct delivery is not currently listed in our
                    dataset for this pincode. Please contact our support team for custom shipping options.
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-wider shrink-0">
                Unavailable
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-200">
                      {searchResults.isExact
                        ? `Delivery Available for Pincode ${searchResults.query}`
                        : `Found ${searchResults.items.length} Serviceable Delivery Centers`}
                    </h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                      {searchResults.isExact
                        ? `Serviceable through ${searchResults.items.length} delivery center hub(s) in ${searchResults.items[0]?.state || "India"}.`
                        : `Showing active logistics centers matching your search criteria.`}
                    </p>
                  </div>
                </div>
                <span className="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shrink-0">
                  Serviceable
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.items.slice(0, 99).map((center, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/70 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-sm">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base leading-snug truncate">
                            {center.center}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>📍 {center.state || "India"}</span>
                            <span>•</span>
                            <span className="font-mono font-semibold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">
                              {center.pincode}
                            </span>
                          </div>
                        </div>
                      </div>

                      {center.areas && center.areas.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                            <span>Covered Landmark Areas</span>
                            <span>{center.areas.length} locations</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                            {center.areas.map((a, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-2 py-0.5 rounded-md text-xs bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {searchResults.items.length > 99 && (
                <div className="text-center text-xs text-gray-500 py-3">
                  Showing first 99 matching hubs. Refine your search for specific locations.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}
