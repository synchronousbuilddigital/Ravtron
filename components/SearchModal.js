"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../app/context/CartContext";
import { Search } from "lucide-react";

export default function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen, addToCart, products: productList } = useCart();
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.trim() === "" || !Array.isArray(productList)) {
      setFiltered([]);
    } else {
      const term = query.toLowerCase().trim();
      const tokens = term
        .split(/[\s,·\-\/]+/)
        .map((w) => w.trim().replace(/s$/, ""))
        .filter((w) => w.length > 1);

      const match = productList.filter((p) => {
        const fullText = `${p.name} ${p.category} ${p.shortSpec || ""} ${p.description || ""} ${p.color || ""}`.toLowerCase();
        if (fullText.includes(term)) return true;
        return tokens.length > 0 && tokens.every((tok) => fullText.includes(tok));
      });
      setFiltered(match);
    }
  }, [query, productList]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-24 px-4 bg-slate-900/50 backdrop-blur-md" onClick={() => setIsSearchOpen(false)}>
      <div 
        className="w-full max-w-2xl rounded-2xl glass-panel p-6 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 border-b border-[#1E293B]/15 pb-4">
          <svg className="w-6 h-6 text-[#1E293B]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search docking stations, converters, type-c cables..."
            className="flex-1 bg-transparent text-xl font-medium text-[#1E293B] outline-none placeholder-[#334155]/40"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-full hover:bg-[#3674B5]/5 text-[#1E293B]/60 hover:text-[#1E293B] transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Results / Suggestions */}
        <div className="mt-6 max-h-[350px] overflow-y-auto pr-1">
          {query.trim() === "" ? (
            <div>
              <h4 className="text-xs font-semibold text-[#1E293B]/40 uppercase tracking-wider mb-3">Popular Searches</h4>
              <div className="flex flex-wrap gap-2">
                {["Display Cables", "Docking Stations", "Converters", "Webcam", "CCTV Power Supply"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[#3674B5]/5 hover:bg-[#3674B5]/10 text-[#1E293B] transition-all"
                  >
                    <Search className="w-3.5 h-3.5 text-[#1E293B]/50" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-[#1E293B]/40 uppercase tracking-wider mb-1">
                Products Found ({filtered.length})
              </h4>
              {filtered.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#3674B5]/5 transition-all border border-transparent hover:border-[#1E293B]/10 cursor-pointer"
                  onClick={() => {
                    setIsSearchOpen(false);
                    router.push(`/product/${product.id}`);
                  }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-16 h-16 rounded-lg object-contain bg-[#F8F9FA] p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-sm text-[#1E293B] truncate">{product.name}</h5>
                    <p className="text-xs text-[#1E293B]/60 truncate mt-0.5">{product.shortSpec}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sm text-[#3674B5]">₹{product.price.toLocaleString()}</span>
                      <span className="text-xs text-[#1E293B]/40 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  {typeof product.stock === "number" && product.stock <= 0 ? (
                    <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-extrabold cursor-not-allowed">
                      Out of Stock
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                        setIsSearchOpen(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-[#1E293B]/50 font-medium">No products found for "{query}"</p>
              <p className="text-sm text-[#1E293B]/40 mt-1">Try searching for something else like "docking station" or "cable"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
