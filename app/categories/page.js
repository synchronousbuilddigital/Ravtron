"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import CartDrawer from "../../components/CartDrawer";
import { useCart } from "../context/CartContext";
import { Cable, Zap, Briefcase, Camera, Laptop, Tv, Network } from "lucide-react";

const themeMap = {
  "Cables": {
    bg: "bg-[#3674B5]/10",
    border: "border-[#3674B5]/40",
    glow: "rgba(54, 116, 181, 0.15)",
    image: "/logo.png"
  },
  "Converters": {
    bg: "bg-[#DEC89E]/10",
    border: "border-[#DEC89E]/30",
    glow: "rgba(222, 200, 158, 0.2)",
    image: "/logo.png"
  },
  "Accessories": {
    bg: "bg-[#3674B5]/10",
    border: "border-[#3674B5]/40",
    glow: "rgba(54, 116, 181, 0.15)",
    image: "/logo.png"
  },
  "Surveillance": {
    bg: "bg-[#DEC89E]/10",
    border: "border-[#DEC89E]/30",
    glow: "rgba(222, 200, 158, 0.2)",
    image: "/logo.png"
  },
  "Docking Stations": {
    bg: "bg-[#3674B5]/10",
    border: "border-[#3674B5]/40",
    glow: "rgba(54, 116, 181, 0.15)",
    image: "/logo.png"
  },
  "Audio Video": {
    bg: "bg-[#DEC89E]/10",
    border: "border-[#DEC89E]/30",
    glow: "rgba(222, 200, 158, 0.2)",
    image: "/logo.png"
  },
  "Networking": {
    bg: "bg-[#3674B5]/10",
    border: "border-[#3674B5]/40",
    glow: "rgba(54, 116, 181, 0.15)",
    image: "/logo.png"
  }
};

const getCategoryIcon = (categoryName) => {
  const iconClass = "w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-[#1E293B]/70";
  switch (categoryName) {
    case "Cables":
      return <Cable className={iconClass} />;
    case "Converters":
      return <Zap className={iconClass} />;
    case "Accessories":
      return <Briefcase className={iconClass} />;
    case "Surveillance":
      return <Camera className={iconClass} />;
    case "Docking Stations":
      return <Laptop className={iconClass} />;
    case "Audio Video":
      return <Tv className={iconClass} />;
    case "Networking":
      return <Network className={iconClass} />;
    default:
      return <Briefcase className={iconClass} />;
  }
};

export default function CategoriesPage() {
  const router = useRouter();
  const { categories: categoriesList } = useCart();
  const [expandedCategories, setExpandedCategories] = useState({});

  const handleCategoryClick = (categoryName) => {
    router.push(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  const sortedCategories = React.useMemo(() => {
    if (!Array.isArray(categoriesList)) return [];
    return [...categoriesList].sort((a, b) => {
      const aPos = a.homePosition > 0 ? a.homePosition : 999;
      const bPos = b.homePosition > 0 ? b.homePosition : 999;
      if (aPos !== bPos) return aPos - bPos;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [categoriesList]);

  return (
    <div className="min-h-screen bg-bg-brand text-text-brand antialiased selection:bg-[#3674B5] selection:text-white">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 md:pt-8 pb-16 md:pb-24 space-y-6 md:space-y-12 relative z-10">
        
        {/* Categories Grid (2 Columns on Mobile, 4 Columns on Large Screens) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {sortedCategories.map((category) => {
            const theme = themeMap[category.name] || {
              bg: "bg-[#3674B5]/5",
              border: "border-[#1E293B]/15",
              glow: "rgba(26, 25, 23, 0.05)",
              image: "/logo.png"
            };

            const categoryImage = category.image || theme.image;

            return (
              <div
                key={category.name}
                className="group relative rounded-2xl md:rounded-[2rem] bg-white border border-[#1E293B]/10 overflow-hidden flex flex-col justify-between hover-lift transition-all duration-500 cursor-pointer h-full shadow-2xs"
                onClick={() => handleCategoryClick(category.name)}
              >
                {/* Ambient Glow */}
                <div 
                  className="absolute -top-20 -left-20 w-56 h-56 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`
                  }}
                />

                {/* Studio-lit Photo Container */}
                <div className="relative w-full h-32 md:h-56 bg-[#F8F9FA] flex items-center justify-center p-0 border-b border-[#1E293B]/5 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1917]/0 to-[#1A1917]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Floating Icon Badge */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-full bg-white/85 backdrop-blur-md border border-[#1E293B]/10 shadow-2xs">
                    {getCategoryIcon(category.name)}
                  </div>

                  <img 
                    src={categoryImage} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 group-hover:rotate-1"
                    style={{
                      filter: "drop-shadow(0 12px 18px rgba(26,25,23,0.06))"
                    }}
                  />
                </div>

                {/* Text Content Block */}
                <div className="p-3 md:p-6 flex-grow flex flex-col justify-between space-y-2 md:space-y-5">
                  <div className="space-y-1.5 md:space-y-3">
                    <h3 className="font-display font-black text-xs md:text-xl text-[#1E293B] group-hover:text-[#3674B5] transition-colors duration-300 uppercase">
                      {category.name}
                    </h3>
                    {/* Uniform 2x2 Grid of Subcategory Boxes with Inline +X MORE Expand / LESS Collapse */}
                    {Array.isArray(category.subcategories) && category.subcategories.length > 0 && (() => {
                      const isExpanded = !!expandedCategories[category.name];
                      const hasMore = category.subcategories.length > 4;
                      const visibleSubs = (hasMore && !isExpanded) ? category.subcategories.slice(0, 3) : category.subcategories;
                      const remainingCount = category.subcategories.length - 3;

                      return (
                        <div className="grid grid-cols-2 gap-2 pt-2 z-10 w-full transition-all duration-300">
                          {visibleSubs.map((sub) => (
                            <button
                              key={sub}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/shop?category=${encodeURIComponent(category.name)}&search=${encodeURIComponent(sub)}`);
                              }}
                              className="w-full py-2 px-2.5 rounded-xl border border-[#1E293B]/10 bg-[#F8F9FA] hover:bg-[#3674B5] hover:text-white hover:border-[#3674B5] transition-all text-center text-[10px] md:text-xs font-extrabold text-[#1E293B]/80 uppercase tracking-wider shadow-2xs active:scale-95 flex items-center justify-center truncate"
                              title={`Browse ${sub} in ${category.name}`}
                            >
                              <span className="truncate">{sub}</span>
                            </button>
                          ))}

                          {hasMore && !isExpanded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCategories((prev) => ({ ...prev, [category.name]: true }));
                              }}
                              className="w-full py-2 px-2.5 rounded-xl border border-[#3674B5]/40 bg-[#3674B5]/10 hover:bg-[#3674B5] text-[#3674B5] hover:text-white transition-all text-center text-[10px] md:text-xs font-black uppercase tracking-wider shadow-2xs active:scale-95 flex items-center justify-center cursor-pointer"
                              title={`Expand to view all ${category.subcategories.length} subcategories`}
                            >
                              <span>+{remainingCount} MORE</span>
                            </button>
                          )}

                          {hasMore && isExpanded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCategories((prev) => ({ ...prev, [category.name]: false }));
                              }}
                              className="w-full py-2 px-2.5 rounded-xl border border-[#1E293B]/20 bg-[#1E293B]/5 hover:bg-[#1E293B] text-[#1E293B]/70 hover:text-white transition-all text-center text-[10px] md:text-xs font-black uppercase tracking-wider shadow-2xs active:scale-95 flex items-center justify-center cursor-pointer"
                              title="Collapse subcategories"
                            >
                              <span>LESS ▲</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Bottom Browse CTA Link */}
                  <div className="pt-1 flex items-center gap-1 text-[10px] md:text-xs font-extrabold text-[#3674B5] uppercase tracking-wider">
                    <span>Explore</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
 
        {/* Explore All Shop Products CTA Button */}
        <div className="pt-8 md:pt-16 text-center">
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 md:px-8 md:py-4.5 rounded-full bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-97 shadow-lg shadow-[#3674B5]/15"
          >
            <span>Explore All Products</span>
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
 
      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}
