"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../context/CartContext";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subParam = searchParams.get("sub") || searchParams.get("subcategory");
  const searchParam = searchParams.get("search") || searchParams.get("q") || searchParams.get("tag");

  const {
    addToCart,
    updateQuantity,
    toggleWishlist,
    wishlist,
    cart,
    products: productList,
    productsLoading,
    categories: categoriesList,
    categoriesLoading,
  } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [searchInput, setSearchInput] = useState(searchParam || "");

  const loading = productsLoading || categoriesLoading;

  // Sync category, subcategory & search state with query parameter
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory("All");
    }

    if (subParam) {
      setActiveSubcategory(subParam);
    } else {
      setActiveSubcategory("All");
    }

    setSearchInput(searchParam || "");
  }, [categoryParam, subParam, searchParam]);

  // 250ms Debounced sync for search input changes to URL parameter
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const currentUrlSearch = params.get("search") || params.get("q") || params.get("tag") || "";
      const trimmedInput = searchInput.trim();

      if (trimmedInput !== currentUrlSearch) {
        if (trimmedInput) {
          params.set("search", trimmedInput);
        } else {
          params.delete("search");
          params.delete("q");
          params.delete("tag");
        }
        const newUrl = params.toString() ? `/shop?${params.toString()}` : "/shop";
        router.replace(newUrl, { scroll: false });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput, router]);

  const handleFilterClick = (categoryName) => {
    const params = new URLSearchParams(window.location.search);
    if (categoryName === "All") {
      params.delete("category");
    } else {
      params.set("category", categoryName);
    }
    params.delete("sub");
    params.delete("subcategory");
    setActiveSubcategory("All");
    const newUrl = params.toString() ? `/shop?${params.toString()}` : "/shop";
    router.push(newUrl);
  };

  const handleSubcategoryFilterClick = (subName) => {
    const params = new URLSearchParams(window.location.search);
    if (subName === "All") {
      params.delete("sub");
      params.delete("subcategory");
    } else {
      params.set("sub", subName);
    }
    params.delete("search");
    params.delete("q");
    params.delete("tag");
    setSearchInput("");
    const newUrl = params.toString() ? `/shop?${params.toString()}` : "/shop";
    router.push(newUrl);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSubcategory("All");
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    params.delete("q");
    params.delete("tag");
    params.delete("sub");
    params.delete("subcategory");
    const newUrl = params.toString() ? `/shop?${params.toString()}` : "/shop";
    router.push(newUrl);
  };

  const activeSearchTerm = searchInput.trim();

  // Compute available subcategories for the active category
  const availableSubcategories = React.useMemo(() => {
    if (!Array.isArray(categoriesList)) return [];
    if (activeCategory !== "All") {
      const foundCat = categoriesList.find(
        (c) => c.name.toLowerCase().trim() === activeCategory.toLowerCase().trim()
      );
      return Array.isArray(foundCat?.subcategories) ? foundCat.subcategories : [];
    }
    const set = new Set();
    categoriesList.forEach((c) => {
      if (Array.isArray(c.subcategories)) {
        c.subcategories.forEach((s) => set.add(s));
      }
    });
    return Array.from(set);
  }, [categoriesList, activeCategory]);

  const filteredProducts = !Array.isArray(productList)
    ? []
    : productList.filter((p) => {
        // 1. Category match
        const matchesCategory =
          activeCategory === "All" ||
          p.category.toLowerCase().trim() === activeCategory.toLowerCase().trim();

        if (!matchesCategory) return false;

        // 2. Explicit Subcategory match (if activeSubcategory set via pill or ?sub=)
        if (activeSubcategory && activeSubcategory !== "All") {
          const pSub = (p.subcategory || "").toLowerCase().trim();
          const targetSub = activeSubcategory.toLowerCase().trim();
          if (pSub !== targetSub) return false;
        }

        // 3. Search query / query parameter match
        if (!activeSearchTerm && !subParam) return true;

        const term = (activeSearchTerm || subParam || "").toLowerCase().trim();
        const pSub = (p.subcategory || "").toLowerCase().trim();

        // Check if query is a known subcategory
        const matchesKnownSubcat = availableSubcategories.some(
          (s) => s.toLowerCase().trim() === term
        );

        if (matchesKnownSubcat) {
          return pSub === term;
        }

        // General text search
        const fullText = `${p.name} ${p.category} ${p.subcategory || ""} ${p.shortSpec || ""} ${p.description || ""} ${p.color || ""}`.toLowerCase();

        if (fullText.includes(term)) return true;

        const tokens = term
          .split(/[\s,·\-\/]+/)
          .map((w) => w.trim().replace(/s$/, ""))
          .filter((w) => w.length > 1);

        return tokens.length > 0 && tokens.every((tok) => fullText.includes(tok));
      });

  const filterOptions = ["All", ...(Array.isArray(categoriesList) ? categoriesList.map((c) => c.name) : [])];

  return (
    <div className="min-h-screen bg-bg-brand text-text-brand antialiased selection:bg-[#3674B5] selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-16 md:pb-24 relative z-10 space-y-6 md:space-y-8">
        
        {/* Top Control Bar: Category Filter Pills on Left, Search Bar on Right */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 md:gap-3 py-2 border-b border-[#1E293B]/10">
          
          {/* LEFT SIDE: Category Filter Pills Bar */}
          <div className="flex items-center justify-start lg:justify-between gap-1 md:gap-1.5 p-1.5 px-2 sm:px-3 bg-slate-100 border border-slate-300/80 rounded-2xl sm:rounded-full overflow-x-auto scrollbar-none scroll-smooth flex-grow min-w-0 shadow-inner">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleFilterClick(opt)}
                className={`px-3 py-1.5 sm:px-4 rounded-xl sm:rounded-full text-xs font-extrabold transition-all duration-300 hover:scale-[1.02] active:scale-97 whitespace-nowrap shrink-0 ${activeCategory === opt
                    ? "bg-[#3674B5] text-white shadow-sm font-black"
                    : "text-[#1E293B] hover:text-[#3674B5] hover:bg-white"
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* RIGHT SIDE: Search Input Box Pill */}
          <div className="relative w-full lg:w-64 xl:w-72 shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-[#1E293B]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-full pl-10 pr-9 py-2 md:py-2.5 text-xs font-bold text-[#1E293B] placeholder-[#1E293B]/60 outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 shadow-xs transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-black text-[#1E293B]/60 hover:text-[#1E293B]"
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* SUB-CATEGORIES FILTER PILLS BAR */}
        {availableSubcategories.length > 0 && (
          <div className="flex items-center justify-start gap-1.5 p-1.5 sm:p-2 px-2 sm:px-3 bg-blue-50/60 border border-[#3674B5]/20 rounded-2xl overflow-x-auto scrollbar-none scroll-smooth shadow-2xs w-full min-w-0">
            <span className="text-[9px] sm:text-[10px] font-black text-[#3674B5] uppercase tracking-wider pl-1 pr-0.5 shrink-0">
              <span className="hidden sm:inline">Subcategories:</span>
              <span className="sm:hidden">Sub:</span>
            </span>
            <button
              onClick={() => handleSubcategoryFilterClick("All")}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold uppercase transition-all whitespace-nowrap shrink-0 ${
                activeSubcategory === "All"
                  ? "bg-[#3674B5] text-white shadow-2xs font-black"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All {activeCategory !== "All" ? activeCategory : ""}
            </button>
            {availableSubcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => handleSubcategoryFilterClick(sub)}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold uppercase transition-all whitespace-nowrap shrink-0 ${
                  activeSubcategory.toLowerCase() === sub.toLowerCase()
                    ? "bg-[#3674B5] text-white shadow-2xs font-black"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Active Subcategory / Search Filter Indicator Banner */}
        {(activeSearchTerm || (activeSubcategory && activeSubcategory !== "All")) && (
          <div className="flex items-center justify-between bg-[#3674B5]/8 border border-[#3674B5]/20 rounded-2xl px-5 py-3 text-xs font-bold text-[#1E293B] max-w-xl mx-auto shadow-2xs">
            <span>
              Showing results for <span className="text-[#3674B5] font-extrabold">&ldquo;{activeSubcategory !== "All" ? activeSubcategory : activeSearchTerm}&rdquo;</span>
              {activeCategory !== "All" && <span> in <span className="text-[#1E293B] font-extrabold">{activeCategory}</span></span>}
            </span>
            <button
              onClick={handleClearSearch}
              className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider hover:underline bg-white px-2.5 py-1 rounded-lg border border-[#3674B5]/20 shadow-2xs transition-all hover:scale-105"
            >
              Clear Filter ✕
            </button>
          </div>
        )}

        {/* Products Grid (2 columns on mobile, 4 columns on desktop) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
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
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.some((item) => item.id === product.id);
              const cartItemQty = Array.isArray(cart)
                ? cart
                    .filter((item) => String(item.id) === String(product.id) || String(item._id) === String(product.id))
                    .reduce((sum, item) => sum + item.quantity, 0)
                : 0;
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
                    {/* Top Row: Badges & Wishlist */}
                    <div className="flex items-center justify-between z-10 relative">
                      {typeof product.stock === "number" && product.stock <= 0 ? (
                        <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 tracking-wider shadow-xs">
                          OUT OF STOCK
                        </span>
                      ) : Boolean(product.discountBadge && product.discountBadge.trim()) ? (
                        <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full backdrop-blur-md bg-white/80 border border-[#1E293B]/10 text-[#1E293B] tracking-wider shadow-xs">
                          {product.discountBadge}
                        </span>
                      ) : <div />}

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

                    {/* Image Area */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-[#EAEAEA] overflow-hidden mt-2 mb-2 sm:mt-2.5 sm:mb-2.5 transition-colors duration-500 group-hover:bg-[#E2E2E2] flex items-center justify-center hover-lift-inner">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1917]/0 to-[#1A1917]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 150px, (max-width: 768px) 250px, 300px"
                        className={`object-cover mix-blend-multiply transition-all duration-500 group-hover:scale-106 group-hover:rotate-1 pointer-events-none ${typeof product.stock === "number" && product.stock <= 0 ? "grayscale opacity-75" : ""}`}
                        style={{
                          filter: "drop-shadow(0 12px 20px rgba(26,25,23,0.06))"
                        }}
                      />
                    </div>

                    {/* Meta info block */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-[#1E293B]/40 uppercase tracking-wider">
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

                      <h3 className="font-display font-bold text-[11px] sm:text-sm md:text-base text-[#1E293B] tracking-tight line-clamp-1 group-hover:text-[#3674B5] transition-colors duration-300">
                        {product.name}
                      </h3>

                      {/* Hidden on mobile to fit 2-column grid cleanly */}
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
          <div className="text-center py-24 space-y-4">
            <h2 className="font-display font-black text-2xl text-[#1E293B]">No products found</h2>
            <p className="text-sm font-semibold text-[#1E293B]/40">We currently don't have items in this category.</p>
          </div>
        )}
      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-brand flex items-center justify-center text-sm font-bold text-[#1E293B]/40 uppercase tracking-widest">Loading RAVTRON Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
