"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import CartDrawer from "../../components/CartDrawer";
import Link from "next/link";
import Image from "next/image";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, updateQuantity, cart, showToast } = useCart();

  const handleClearWishlist = () => {
    if (confirm("Are you sure you want to clear your wishlist?")) {
      wishlist.forEach((item) => toggleWishlist(item));
      showToast("Cleared wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-bg-brand text-text-brand antialiased selection:bg-[#3674B5] selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-12 pb-16 md:pb-24 relative z-10 space-y-8 md:space-y-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#1E293B]/10 pb-6 md:pb-8">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
              <svg className="w-3.5 h-3.5 text-[#3674B5] fill-[#3674B5] animate-pulse" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
                Saved Items ({wishlist.length})
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#1E293B] tracking-tight leading-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3674B5] to-[#578FCA]">Wishlist</span>
            </h1>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="px-6 py-3 border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold rounded-full transition-all duration-300 hover:scale-103 active:scale-97 cursor-pointer"
            >
              Clear All Items
            </button>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((product) => {
              const cartItemQty = cart
                .filter((i) => String(i.id) === String(product.id) || String(i._id) === String(product.id))
                .reduce((total, i) => total + i.quantity, 0);
              const specItems = product.shortSpec.split(" · ").filter(spec => spec.length < 25 && spec.trim().length > 0);

              const glowColor =
                product.id === "p1" ? "rgba(140, 153, 133, 0.15)" :
                  product.id === "p2" ? "rgba(222, 200, 158, 0.25)" :
                    "rgba(195, 146, 129, 0.15)";

              const swatchColor =
                product.color.includes("Sage") ? "#8C9985" :
                  product.color.includes("Sand") || product.color.includes("Gold") ? "#DEC89E" :
                    product.color.includes("Clay") ? "#C39281" :
                      product.color.includes("Cream") ? "#EDECE6" : "#1A1917";

              return (
                <div
                  key={product.id}
                  className="group relative rounded-xl sm:rounded-3xl bg-white border border-[#1E293B]/10 p-2.5 sm:p-4.5 flex flex-col justify-between hover-lift transition-all duration-500 overflow-hidden cursor-pointer shadow-2xs w-full max-w-[300px] mx-auto"
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  {/* Hover ambient light */}
                  <div
                    className="absolute -top-20 -left-20 w-56 h-56 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
                    }}
                  />

                  <div>
                    {/* Top Row: Badges & Wishlist Toggle */}
                    <div className="flex items-center justify-between z-10 relative">
                      {Boolean(product.discountBadge && product.discountBadge.trim()) ? (
                        <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full backdrop-blur-md bg-white/80 border border-[#1E293B]/10 text-[#1E293B] tracking-wider shadow-xs">
                          {product.discountBadge}
                        </span>
                      ) : <div />}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className="p-1.5 sm:p-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 shadow-xs bg-[#3674B5]/15 border-[#3674B5]/40 text-[#3674B5]"
                        aria-label="Remove from Wishlist"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill="currentColor"
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

                    {/* Image Area */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-[#EAEAEA] overflow-hidden mt-2 mb-2 sm:mt-2.5 sm:mb-2.5 transition-colors duration-500 group-hover:bg-[#E2E2E2] flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1917]/0 to-[#1A1917]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 150px, (max-width: 768px) 250px, 300px"
                        className="object-cover mix-blend-multiply transition-all duration-500 group-hover:scale-106 group-hover:rotate-1"
                        style={{
                          filter: "drop-shadow(0 12px 20px rgba(26,25,23,0.06))"
                        }}
                      />
                    </div>

                    {/* Meta info block */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-[#1E293B]/40 uppercase tracking-wider">
                        <span>{product.category}</span>
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <span
                            className="w-2 h-2 sm:w-2 sm:h-2 rounded-full border border-[#1E293B]/15 shadow-xs"
                            style={{ backgroundColor: swatchColor }}
                            title={product.color}
                          />
                          <span className="text-[8px] sm:text-[9px] font-semibold tracking-normal text-[#1E293B]/50 lowercase first-letter:uppercase">{product.color}</span>
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-[11px] sm:text-sm md:text-base text-[#1E293B] tracking-tight line-clamp-1 group-hover:text-[#3674B5] transition-colors duration-300">
                        {product.name}
                      </h3>

                      {/* Specs */}
                      <div className="hidden sm:flex flex-wrap gap-1">
                        {specItems.map((spec, i) => (
                          <span
                            key={i}
                            className="text-[8px] sm:text-[9px] font-semibold text-[#1E293B]/60 bg-[#F8F9FA] px-1.5 py-0.5 rounded-md border border-[#1E293B]/2 line-clamp-2"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

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
                        <span className="text-[8px] sm:text-[9px] text-[#1E293B]/40 font-medium">({product.reviewsCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
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
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16 sm:py-24 space-y-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#1E293B]/20 animate-bounce">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-[#1E293B]">Your Wishlist is Empty</h2>
              <p className="text-xs md:text-sm font-semibold text-[#1E293B]/40 leading-relaxed max-w-xs mx-auto">
                Explore our catalog and find the perfect fast charging and high-efficiency accessories for your setup.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex px-8 py-3.5 bg-[#3674B5] hover:bg-[#578FCA] text-white rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-md shadow-[#3674B5]/15"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}
