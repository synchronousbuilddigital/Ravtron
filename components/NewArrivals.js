"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../app/context/CartContext";
import Image from "next/image";

export default function NewArrivals({ productList = [], loading = false }) {
  const router = useRouter();
  const { addToCart, updateQuantity, toggleWishlist, wishlist, cart } = useCart();

  // Filter to show new products
  let newProducts = Array.isArray(productList) ? productList.filter((p) => p.isNewArrival) : [];

  // Fallback: If no products have isNewArrival flagged, show the 4 most recent products
  if (newProducts.length === 0 && Array.isArray(productList) && productList.length > 0) {
    newProducts = [...productList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return (
    <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-bg-brand">
      {/* Decorative subtle background ambient glows */}
      <div className="absolute top-1/4 right-1/10 w-96 h-96 rounded-full bg-[#E8EFE5] opacity-35 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/10 w-96 h-96 rounded-full bg-[#E5D0C6] opacity-25 blur-3xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 relative z-10">

        {/* Section Header with Premium Sage theme */}
        <div className="border-b border-[#1E293B]/10 pb-4 md:pb-8 text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3674B5] animate-pulse" />
              <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
                Fresh Releases
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1E293B] tracking-tight leading-tight">
              Just <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3674B5] to-[#578FCA]">Landed</span>
            </h2>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl sm:rounded-3xl bg-white border border-[#1E293B]/10 p-2.5 sm:p-4.5 flex flex-col justify-between overflow-hidden shadow-2xs w-full max-w-[300px] mx-auto h-[320px] xs:h-[360px] sm:h-[420px] md:h-[450px] animate-pulse animate-duration-1000"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="h-4.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="aspect-square w-full rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 mt-2 mb-2 sm:mt-2.5 sm:mb-2.5" />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-6 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="hidden sm:flex gap-1">
                      <div className="h-3.5 w-12 bg-slate-50 dark:bg-slate-800 rounded" />
                      <div className="h-3.5 w-16 bg-slate-50 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-3 w-1/4 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                  <div className="space-y-1">
                    <div className="h-2.5 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-7 w-12 sm:h-9 sm:w-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : newProducts.length > 0 ? (
          <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-none">
            {newProducts.slice(0, 4).map((product) => {
              const isWishlisted = wishlist.some((item) => item.id === product.id);
              const cartItemQty = Array.isArray(cart)
                ? cart
                    .filter((item) => String(item.id) === String(product.id) || String(item._id) === String(product.id))
                    .reduce((sum, item) => sum + item.quantity, 0)
                : 0;
              const specItems = product.shortSpec.split(" · ").filter(spec => spec.length < 25 && spec.trim().length > 0);

              // Determine ambient glow color based on product ID/theme
              const glowColor =
                product.id === "p5" ? "rgba(195, 146, 129, 0.15)" :
                  product.id === "p3" ? "rgba(222, 200, 158, 0.25)" :
                    "rgba(140, 153, 133, 0.15)";

              // Determine swatch color
              const swatchColor =
                product.color.includes("Sage") ? "#8C9985" :
                  product.color.includes("Sand") || product.color.includes("Gold") ? "#DEC89E" :
                    product.color.includes("Clay") ? "#C39281" :
                      product.color.includes("Cream") ? "#EDECE6" : "#1A1917";

              return (
                <div
                  key={product.id}
                  className="group relative rounded-2xl sm:rounded-3xl bg-white border border-[#1E293B]/10 p-2.5 sm:p-4.5 flex flex-col justify-between hover-lift transition-all duration-500 overflow-hidden cursor-pointer flex-shrink-0 w-[240px] sm:w-[280px] md:w-full md:max-w-[300px] mx-auto snap-center"
                  style={{
                    boxShadow: "0 10px 30px -15px rgba(26, 25, 23, 0.03)"
                  }}
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  {/* Floating Ambient Hover Glow */}
                  <div
                    className="absolute -top-20 -left-20 w-56 h-56 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
                    }}
                  />

                  <div>
                    {/* Product Card Top: Badges & Wishlist */}
                    <div className="flex items-center justify-between z-10 relative">
                      <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full backdrop-blur-md bg-white/80 border border-[#1E293B]/10 text-[#1E293B] tracking-wider shadow-xs">
                        {product.discountBadge || "NEW RELEASE"}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className={`p-1.5 sm:p-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 shadow-xs ${isWishlisted
                          ? "bg-[#3674B5]/15 border-[#3674B5]/40 text-[#3674B5]"
                          : "bg-white/80 border-[#1E293B]/10 text-[#1E293B]/40 hover:text-[#1E293B] hover:bg-white"
                          }`}
                        aria-label="Add to Wishlist"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill={isWishlisted ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Product Image Frame */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-[#EAEAEA] overflow-hidden mt-2 mb-2 sm:mt-2.5 sm:mb-2.5 transition-colors duration-500 group-hover:bg-[#E2E2E2] flex items-center justify-center hover-lift-inner">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1917]/0 to-[#1A1917]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, 300px"
                        className="object-cover mix-blend-multiply transition-all duration-500 group-hover:scale-106 group-hover:rotate-1 pointer-events-none"
                        style={{
                          filter: "drop-shadow(0 12px 20px rgba(26,25,23,0.06))"
                        }}
                      />
                    </div>

                    {/* Info Container */}
                    <div className="space-y-1 sm:space-y-1.5">
                      {/* Category & Color Indicator Row */}
                      <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-[#1E293B]/40 uppercase tracking-wider sm:tracking-widest">
                        <span>{product.category}</span>
                        {product.color && product.color.toLowerCase() !== "standard" && (
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <span
                              className="w-2 h-2 sm:w-2 sm:h-2 rounded-full border border-[#1E293B]/15 shadow-xs"
                              style={{ backgroundColor: swatchColor }}
                              title={product.color}
                            />
                            <span className="text-[8px] sm:text-[9px] font-semibold tracking-normal text-[#1E293B]/50 lowercase first-letter:uppercase">{product.color}</span>
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="font-display font-bold text-[11px] sm:text-sm md:text-base text-[#1E293B] tracking-tight line-clamp-1 group-hover:text-[#3674B5] transition-colors duration-300">
                        {product.name}
                      </h3>

                      {/* Specifications Grid Tags */}
                      <div className="flex flex-wrap gap-1">
                        {specItems.map((spec, i) => (
                          <span
                            key={i}
                            className="text-[8px] sm:text-[9px] font-semibold text-[#1E293B]/60 bg-[#F8F9FA] px-1.5 py-0.5 rounded-md border border-[#1E293B]/2 line-clamp-2"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Star Rating & Reviews */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.floor(product.rating) ? "fill-current" : "stroke-current fill-none"
                                }`}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.77-.57-.37-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.518-4.674z"
                              />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[9px] sm:text-xs font-bold text-[#1E293B]">{product.rating}</span>
                        <span className="text-[8px] sm:text-[9px] text-[#1E293B]/40 font-medium line-clamp-1">({product.reviewsCount})</span>
                      </div>
                    </div>

                  </div>

                  {/* Pricing and Button row */}
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#1E293B]/10 mt-2 relative z-10 min-w-0">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-[8px] sm:text-[9px] font-extrabold text-[#3674B5] uppercase tracking-wider block truncate">
                        Save ₹{(product.originalPrice - product.price).toLocaleString()}
                      </span>
                      <div className="flex items-baseline gap-1 truncate">
                        <span className="text-xs sm:text-sm md:text-base font-black text-[#3674B5]">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-[#1E293B]/30 line-through font-medium">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {typeof product.stock === "number" && product.stock <= 0 ? (
                      <span className="px-2 py-1 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 cursor-not-allowed shrink-0">
                        Out of Stock
                      </span>
                    ) : cartItemQty > 0 ? (
                      <div 
                        className="inline-flex items-center rounded-lg sm:rounded-xl bg-[#3674B5] text-white font-extrabold shadow-md overflow-hidden shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(product.id, -1);
                          }}
                          className="px-1.5 py-1 sm:px-2.5 sm:py-2 hover:bg-[#578FCA] transition-colors flex items-center justify-center cursor-pointer text-xs font-black shrink-0"
                          aria-label="Decrease quantity"
                          title="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-1 py-0.5 text-[9px] sm:text-xs font-extrabold whitespace-nowrap">
                          <span className="hidden sm:inline">In Bag </span>({cartItemQty})
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1);
                          }}
                          className="px-1.5 py-1 sm:px-2.5 sm:py-2 hover:bg-[#578FCA] transition-colors flex items-center justify-center cursor-pointer text-xs font-black shrink-0"
                          aria-label="Increase quantity"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="px-2 py-1 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-300 hover:scale-[1.03] active:scale-97 flex items-center justify-center gap-1 shadow-md bg-[#3674B5] hover:bg-[#578FCA] text-white shrink-0"
                      >
                        <span>Add</span>
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-[#1E293B]/10 rounded-3xl bg-white/50">
            <p className="text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">No arrivals available</p>
          </div>
        )}

        {/* Centered Explore Button at the bottom */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => router.push("/shop")}
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 text-center"
          >
            <span>Explore Products</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </button>
        </div>

      </div>
    </section>
  );
}

