"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../app/context/CartContext";
import Image from "next/image";

/**
 * Dynamic home page categories grid.
 * Renders up to 6 categories sorted by homePosition (1-6) from the DB.
 * Layout:
 *   Slot 1 → Big card (left, spans 2 rows)
 *   Slots 2-3 → Medium cards (right, top row)
 *   Slots 4-6 → Small cards (right, bottom row)
 *   Uses global context to utilize localStorage cache.
 */
export default function Categories() {
  const router = useRouter();
  const { categories: rawCategories } = useCart();

  const categoriesList = useMemo(() => {
    if (!rawCategories || !Array.isArray(rawCategories)) return [];
    return rawCategories
      .filter((c) => c.homePosition >= 1 && c.homePosition <= 6)
      .sort((a, b) => a.homePosition - b.homePosition)
      .slice(0, 6);
  }, [rawCategories]);

  const handleCategoryClick = (categoryName) => {
    router.push(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  // Map slots to layout classes
  // Slot 0 (index 0, position 1) → big card: col-span-6, row-span-2, tall
  // Slots 1-2 (index 1-2) → medium cards: col-span-3, normal height
  // Slots 3-5 (index 3-5) → small cards: col-span-2, normal height
  const getColClass = (index) => {
    if (index === 0) return "md:col-span-6 md:row-span-2";
    if (index <= 2) return "md:col-span-3";
    return "md:col-span-2";
  };

  const getHeightClass = (index) => {
    if (index === 0) return "h-[110px] sm:h-[160px] md:h-[464px]";
    return "h-[110px] sm:h-[160px] md:h-[220px]";
  };

  if (categoriesList.length === 0) return null;

  return (
    <section id="categories" className="py-8 md:py-16 px-4 sm:px-6 lg:px-8 bg-bg-brand relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-radial from-[#F3F4F6] to-transparent opacity-40 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 md:space-y-5 max-w-2xl mx-auto pb-4 md:pb-5 border-b border-[#1E293B]/10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3674B5] animate-pulse" />
            <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
              Explore Our Collection
            </span>
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#1E293B] tracking-tight leading-tight">
            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3674B5] to-[#578FCA]">Category</span>
          </h2>
          <p className="text-sm sm:text-base font-semibold text-[#1E293B]/50 leading-relaxed">
            Premium connectivity solutions and product collections tailored for your workspace.
          </p>
        </div>

        {/* Dynamic 6-slot Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-6">
          {categoriesList.map((cat, index) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`group relative rounded-2xl md:rounded-[2rem] bg-white border border-[#1E293B]/10 overflow-hidden cursor-pointer shadow-xs flex items-center justify-center hover-lift transition-all duration-500 w-full ${getColClass(index)} ${getHeightClass(index)}`}
            >
              <Image
                src={cat.image || "/logo.png"}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 250px, 350px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-500" />
              <span className="bg-black/80 backdrop-blur-xs text-white text-[9px] sm:text-xs font-black uppercase px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg absolute bottom-3 left-3 sm:bottom-6 sm:left-6 tracking-wider z-10">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
