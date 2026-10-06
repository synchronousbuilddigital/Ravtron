"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import Navbar from "../../../components/Navbar";
import Image from "next/image";
import Footer from "../../../components/Footer";
import SearchModal from "../../../components/SearchModal";
import CartDrawer from "../../../components/CartDrawer";
import { Star, Package, Zap, ShieldCheck } from "lucide-react";
import { ProductJsonLd, BreadcrumbJsonLd } from "../../../components/JsonLd";

const getDescription = (id) => {
  switch (id) {
    case "p1":
      return "Engineered for high-resolution audio and video signal transmission. Features 24K gold-plated connectors, multi-layer EMI shielding, and supports up to 4K Ultra HD resolution at 60Hz for seamless dual-monitor workstations and display setups.";
    case "p2":
      return "Engineered for maximum workstation productivity. This premium solid aluminum 11-in-1 Type-C docking station features dual 4K HDMI displays, 100W Power Delivery pass-through, Gigabit Ethernet, SD/MicroSD card readers, and high-speed USB 3.0 ports.";
    case "p3":
      return "Engineered for maximum signal purity and high-speed audio-video transmission. Features heavy-duty nylon braided outer jacket and 24K gold-plated connectors to protect against signal interference and physical wear.";
    case "p4":
      return "Elevate your professional workspace with stunning video clarity. This 4K ultra-high-definition webcam delivers crystal clear imagery, featuring an integrated LED ring light with adjustable touch-brightness controls to ensure optimal lighting in any environment.";
    case "p5":
      return "Protect your confidential work data on the go with RAVTRON Privacy Screen Filter. Engineered with microlouver technology to block side-angle viewing beyond 60 degrees, while shielding your eyes from glare and blue light radiation.";
    case "p6":
      return "Engineered for high-density network connectivity. Features 100% pure copper conductors and gold-plated RJ45 connectors to deliver crystal-clear Gigabit and 10Gbps data transmission speeds with zero latency.";
    default:
      return "A premium connectivity solution crafted with extreme precision and premium materials to match your modern workstation setup. Engineered with durability and visual aesthetics in mind.";
  }
};

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    cart,
    addToCart,
    updateQuantity,
    setIsCartOpen,
    wishlist,
    toggleWishlist,
    products,
    productsLoading,
    showToast,
    coupons,
    applyCouponCode
  } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPrivacySize, setSelectedPrivacySize] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const [user, setUser] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const breadcrumbItems = product ? [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: product.category || "Products", url: `/shop?category=${encodeURIComponent(product.category || "")}` },
    { name: product.name, url: `/product/${product.id || id}` }
  ] : [];

  // Synchronize product page quantity with existing cart item quantity for the selected variant
  const existingCartItem = Array.isArray(cart) && product
    ? cart.find(
        (item) =>
          (String(item.id) === String(product.id) || String(item._id) === String(product.id)) &&
          (item.selectedSize || null) === (selectedSize || null) &&
          (item.selectedPrivacySize || null) === (selectedPrivacySize || null) &&
          (item.selectedChannel || null) === (selectedChannel || null)
      )
    : null;

  useEffect(() => {
    if (existingCartItem) {
      setQuantity(existingCartItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [existingCartItem?.quantity, selectedSize, selectedPrivacySize, selectedChannel, product?.id]);

  useEffect(() => {
    const session = localStorage.getItem("ravtron_session");
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  // 1. Instantly load basic info from global context cache if available
  useEffect(() => {
    if (products && products.length > 0) {
      const cached = products.find((p) => p.id === id);
      if (cached) {
        setProduct((prev) => {
          if (prev && prev.id === id && prev.gallery && prev.gallery.length > 0) {
            return prev;
          }
          return cached;
        });
        setLoading(false);
      }
    }
  }, [products, id]);

  // 2. Fetch full product details (including gallery base64 array) from server
  useEffect(() => {
    let active = true;
    if (!product || product.id !== id) {
      setLoading(true);
    }
    
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        if (active && data) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch product details", err);
        if (active && (!product || product.id !== id)) {
          setProduct(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  // 3. Initialize selections when product details change
  useEffect(() => {
    if (product) {
      setSelectedImage((curr) => {
        if (curr && product.gallery && product.gallery.includes(curr)) {
          return curr;
        }
        return product.image || "/logo.png";
      });
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize((curr) => (product.sizes.includes(curr) ? curr : product.sizes[0]));
      } else {
        setSelectedSize(null);
      }
      if (product.privacySizes && product.privacySizes.length > 0) {
        setSelectedPrivacySize((curr) => (product.privacySizes.includes(curr) ? curr : product.privacySizes[0]));
      } else {
        setSelectedPrivacySize(null);
      }
      if (product.channels && product.channels.length > 0) {
        setSelectedChannel((curr) => (product.channels.includes(curr) ? curr : product.channels[0]));
      } else {
        setSelectedChannel(null);
      }
    }
  }, [product]);

  useEffect(() => {
    setQuantity(1);
    setActiveTab("overview");
    window.scrollTo(0, 0);
  }, [id]);

  // Auto-cycle gallery images every 3 seconds
  useEffect(() => {
    if (!product || !product.gallery || product.gallery.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImage((currentImg) => {
        const currentIndex = product.gallery.indexOf(currentImg);
        const nextIndex = (currentIndex + 1) % product.gallery.length;
        return product.gallery[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [product, selectedImage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-brand text-text-brand antialiased">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-36 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#3674B5] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Accessory Details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-brand text-text-brand antialiased">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-36 text-center space-y-4">
          <h2 className="font-display font-black text-3xl text-[#1E293B]">Product Not Found</h2>
          <p className="text-sm font-semibold text-[#1E293B]/50">The accessory you are looking for does not exist or has been removed.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl bg-[#3674B5] text-white text-xs font-bold uppercase tracking-wider"
          >
            Go Back Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  // Clean technical specs from raw string
  const getCleanSpecs = (rawSpec) => {
    if (!rawSpec) return [];
    if (rawSpec.includes(" · ")) {
      return rawSpec.split(" · ").filter((s) => s.trim() && !s.includes("SALE PRICE") && !s.includes("REGULAR PRICE"));
    }
    const extracted = [];
    const kvRegex = /(INPUT|OUTPUT|RESOLUTION|DRIVER|HOUSING|COMPATIBLE|SPEED|CONNECTOR|LENGTH|MATERIAL):\s*([A-Z0-9\s&]+?)(?=\s+(?:INPUT|OUTPUT|RESOLUTION|DRIVER|HOUSING|COMPATIBLE|SPEED|CONNECTOR|LENGTH|MATERIAL):|$)/gi;
    let match;
    while ((match = kvRegex.exec(rawSpec)) !== null) {
      extracted.push(`${match[1].trim()}: ${match[2].trim()}`);
    }
    if (extracted.length > 0) return extracted;

    const cleanStr = rawSpec.replace(/RAVTRON.*?PRICE.*?\!/gi, "").trim();
    return cleanStr ? [cleanStr] : [];
  };

  const specItems = getCleanSpecs(product.shortSpec);

  // Resolve pricing overrides based on selected variant size/channel
  const selectedSizeName = selectedSize || selectedPrivacySize || selectedChannel;
  const sizeOverride = product.sizePrices?.find((sp) => sp.size === selectedSizeName);
  const displayPrice = sizeOverride && sizeOverride.price ? sizeOverride.price : product.price;
  const displayOriginalPrice = sizeOverride && sizeOverride.originalPrice ? sizeOverride.originalPrice : product.originalPrice;

  // Related products (filtered from same category or next items in the list)
  const relatedProducts = Array.isArray(products)
    ? products.filter((p) => p.id !== product.id).slice(0, 3)
    : [];

  const cartItemQty = Array.isArray(cart)
    ? cart
        .filter((item) => String(item.id) === String(product.id) || String(item._id) === String(product.id))
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const currentDisplayQty = existingCartItem ? existingCartItem.quantity : quantity;

  // Styling accents based on product ID/theme
  const isSage = product.id === "p1" || product.id === "p5";
  const isSand = product.id === "p2" || product.id === "p6";
  const brandAccent = isSage ? "#8C9985" : isSand ? "#DEC89E" : "#C39281";
  const brandBgLight = isSage ? "bg-[#3674B5]/10" : isSand ? "bg-[#DEC89E]/10" : "bg-[#3674B5]/10";
  const brandBorder = isSage ? "border-[#3674B5]/30" : isSand ? "border-[#DEC89E]/20" : "border-[#3674B5]/30";
  const brandText = isSage ? "text-[#3674B5]" : isSand ? "text-[#DEC89E]" : "text-[#3674B5]";

  const handleAdd = () => {
    addToCart({ 
      ...product, 
      price: displayPrice, 
      originalPrice: displayOriginalPrice, 
      selectedSize, 
      selectedPrivacySize,
      selectedChannel
    }, quantity);
  };

  const handleBuyNow = () => {
    if (!existingCartItem) {
      addToCart({ 
        ...product, 
        price: displayPrice, 
        originalPrice: displayOriginalPrice, 
        selectedSize, 
        selectedPrivacySize,
        selectedChannel
      }, quantity);
    }
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          rating: newRating,
          comment: newComment
        })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit review");
      }
      const updatedProduct = await response.json();
      setProduct(updatedProduct);
      setNewComment("");
      setNewRating(5);
      showToast("Review submitted successfully.");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const discountPercent = displayOriginalPrice > displayPrice 
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-bg-brand text-text-brand antialiased selection:bg-[#3674B5] selection:text-white">
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {/* Dynamic Header Navbar */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 relative z-10">

        {/* Back navigation */}
        <div className="pb-8">
          <button
            onClick={() => router.push("/shop")}
            className="group inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#1E293B]/50 hover:text-[#1E293B] transition-all bg-white border border-[#1E293B]/10 rounded-full px-5 py-2.5 hover-lift shadow-2xs"
          >
            <span className="group-hover:-translate-x-1.5 transition-transform duration-300">←</span>
            <span>Back to Shop</span>
          </button>
        </div>

        {/* Two-Column Details Showcase */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">

          {/* Left Column: Image Gallery Showcase (White Outer Frame with Inner Rounded Grey Square) */}
          <div className="w-full lg:w-1/2 bg-white border border-[#1E293B]/10 rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 flex flex-col justify-between relative shadow-sm">

            {/* Inner Rounded Grey Square Container */}
            <div className="w-full aspect-square relative rounded-2xl md:rounded-3xl bg-[#ECEEF0] overflow-hidden group flex items-center justify-center">
              
              {/* Float Wishlist Trigger */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full border backdrop-blur-xs transition-all duration-300 hover:scale-110 active:scale-95 shadow-xs ${isWishlisted
                    ? "bg-[#3674B5]/15 border-[#3674B5]/40 text-[#3674B5]"
                    : "bg-white/90 border-[#1E293B]/10 text-[#1E293B]/40 hover:text-[#1E293B] hover:bg-white"
                  }`}
                aria-label="Add to Wishlist"
              >
                <svg
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5"
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

              {/* Product Image filling the rounded square cleanly */}
              {(selectedImage || product.image) ? (
                <img
                  src={selectedImage || product.image || "/logo.png"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
            </div>

            {/* Bottom Controls Area (Thumbnails) */}
            {product.gallery && product.gallery.filter(Boolean).length > 0 && (
              <div className="pt-4 sm:pt-6 flex flex-col items-center w-full">
                <div className="flex justify-center gap-3 md:gap-4 w-full">
                  {product.gallery.filter(Boolean).map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl border-2 overflow-hidden bg-[#EAEAEA] p-1.5 md:p-2 flex items-center justify-center transition-all duration-300 ${selectedImage === imgUrl
                          ? "border-[#3674B5] scale-105 shadow-xs"
                          : "border-transparent opacity-60 hover:opacity-100 hover:scale-102"
                        }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Context Info */}
          <div className="w-full lg:w-1/2 flex flex-col space-y-6 md:space-y-7">

            {/* Category tags & Star Rating */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full ${brandBgLight} ${brandBorder} border ${brandText} tracking-widest`}>
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-[#1E293B]">{product.rating}</span>
                <span className="text-xs text-[#1E293B]/40">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            {/* Title & Technical Specs */}
            <div className="space-y-3">
              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#1E293B] tracking-tight leading-snug">
                {product.name}
              </h1>
              {specItems.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {specItems.map((spec, i) => (
                    <span key={i} className="text-[10px] sm:text-xs font-extrabold text-[#3674B5] bg-[#3674B5]/8 border border-[#3674B5]/15 px-3 py-1 rounded-xl uppercase tracking-wider shadow-2xs">
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cable Sizes Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2.5 text-left pt-1">
                <span className="block text-xs font-extrabold uppercase tracking-widest text-[#1E293B]/60">
                  Select Cable Length
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${
                        selectedSize === sz
                          ? "bg-black text-white border-black shadow-xs font-extrabold"
                          : "bg-white text-slate-800 border-slate-200 hover:border-slate-350 hover:bg-slate-50 font-bold"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Screen Sizes Selector */}
            {product.privacySizes && product.privacySizes.length > 0 && (
              <div className="space-y-2.5 text-left pt-1">
                <span className="block text-xs font-extrabold uppercase tracking-widest text-[#1E293B]/60">
                  Select Privacy Screen Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.privacySizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedPrivacySize(sz)}
                      className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${
                        selectedPrivacySize === sz
                          ? "bg-black text-white border-black shadow-xs font-extrabold"
                          : "bg-white text-slate-800 border-slate-200 hover:border-slate-350 hover:bg-slate-50 font-bold"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Channels Selector */}
            {product.channels && product.channels.length > 0 && (
              <div className="space-y-2.5 text-left pt-1">
                <span className="block text-xs font-extrabold uppercase tracking-widest text-[#1E293B]/60">
                  Select Output Channels / Variant
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.channels.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSelectedChannel(ch)}
                      className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${
                        selectedChannel === ch
                          ? "bg-black text-white border-black shadow-xs font-extrabold"
                          : "bg-white text-slate-800 border-slate-200 hover:border-slate-350 hover:bg-slate-50 font-bold"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sleek Compact Pricing Section */}
            <div className="w-fit bg-gradient-to-r from-white via-slate-50/50 to-white border border-[#1E293B]/10 rounded-2xl md:rounded-3xl py-2.5 px-4.5 sm:px-5 flex items-center gap-3.5 shadow-2xs">
              {/* Main Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#3674B5] tracking-tight">
                  ₹{displayPrice.toLocaleString()}
                </span>
                {displayOriginalPrice > displayPrice && (
                  <span className="text-base sm:text-lg md:text-xl text-[#1E293B]/50 line-through font-bold">
                    ₹{displayOriginalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Save Badge (Positioned on the Right Side) */}
              {displayOriginalPrice > displayPrice && (
                <span className="text-[10px] sm:text-xs font-extrabold text-[#3674B5] bg-[#3674B5]/10 border border-[#3674B5]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  Save ₹{(displayOriginalPrice - displayPrice).toLocaleString()} {product.discountBadge ? `(${product.discountBadge})` : discountPercent > 0 ? `(${discountPercent}% OFF)` : ''}
                </span>
              )}
            </div>

            {/* APPLY COUPON & OFFERS Banner (Matching Screenshot Design) */}
            {(() => {
              const applicableCoupons = Array.isArray(coupons)
                ? coupons.filter((c) => c.active && (c.applicableCategory === "All" || c.applicableCategory.toLowerCase() === (product?.category || "").toLowerCase()))
                : [];

              return (
                <div
                  onClick={() => setIsOffersModalOpen(true)}
                  className="bg-[#FFFDF7] border border-[#EAE3D2] hover:border-[#3674B5]/40 transition-all rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 shadow-2xs cursor-pointer group hover:bg-[#FFFBF0]"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FEF3D6] text-[#B8860B] flex items-center justify-center text-base sm:text-lg shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      🎁
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h4 className="text-[11px] sm:text-xs font-black text-[#1E293B] uppercase tracking-wider leading-tight">
                          APPLY COUPON &amp; OFFERS
                        </h4>
                        {applicableCoupons.length > 0 && (
                          <span className="text-[9px] font-black bg-[#3674B5] text-white px-2 py-0.5 rounded-full whitespace-nowrap inline-block">
                            {applicableCoupons.length} AVAILABLE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[#1E293B]/60 truncate">
                        {applicableCoupons.length > 0
                          ? `View all ${applicableCoupons.length} promotional discounts & festive deals`
                          : "View promotional discounts & coupons"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] sm:text-xs font-black text-[#B8860B] group-hover:text-[#3674B5] flex items-center gap-0.5 sm:gap-1 group-hover:translate-x-1 transition-transform shrink-0 whitespace-nowrap pl-1"
                  >
                    <span>View Offers</span>
                    <span>&gt;</span>
                  </button>
                </div>
              );
            })()}

            {/* Premium Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-[#F8F9FA] rounded-2xl border border-slate-100 text-center">
              <div className="flex flex-col items-center gap-0.5">
                <span className={`text-[11px] font-black ${typeof product.stock === "number" && product.stock <= 0 ? "text-rose-600" : "text-[#1E293B]"}`}>
                  {typeof product.stock === "number" && product.stock <= 0 ? "Out of Stock" : "100% Genuine"}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {typeof product.stock === "number" && product.stock <= 0 ? "Currently Unavailable" : "RAVTRON® Product"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5 border-x border-slate-200/60">
                <span className="text-[11px] font-black text-[#3674B5]">1 Year Warranty</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Official Coverage</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[11px] font-black text-[#1E293B]">Fast Dispatch</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pan India Express</span>
              </div>
            </div>

            {/* Direct action rows */}
            {typeof product.stock === "number" && product.stock <= 0 ? (
              <div className="w-full pt-1">
                <button
                  disabled
                  className="w-full h-12 sm:h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-extrabold uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2 shadow-2xs"
                >
                  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>Currently Out of Stock</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 pt-1">
                {/* Add to Bag Button with inline Minus/Plus when in cart */}
                {cartItemQty > 0 ? (
                  <div 
                    className="flex-1 h-12 sm:h-14 px-1 sm:px-3 rounded-2xl bg-[#3674B5] text-white font-extrabold shadow-md flex items-center justify-between border-2 border-[#3674B5] shrink-0 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(product.id, -1);
                      }}
                      className="w-5.5 h-5.5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 rounded-md xs:rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer text-xs sm:text-base font-black shrink-0"
                      aria-label="Decrease quantity"
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-0.5 sm:gap-1.5 select-none whitespace-nowrap px-0.5 min-w-0">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 hidden xs:inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>In Bag ({cartItemQty})</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                      }}
                      className="w-5.5 h-5.5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 rounded-md xs:rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer text-xs sm:text-base font-black shrink-0"
                      aria-label="Increase quantity"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAdd}
                    className="flex-1 h-12 sm:h-14 rounded-2xl border-2 border-[#1E293B] hover:bg-[#F8F9FA] text-[#1E293B] text-xs font-extrabold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-97 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 min-w-0"
                  >
                    <svg className="w-4 h-4 md:w-4.5 md:h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="whitespace-nowrap">Add to Bag</span>
                  </button>
                )}

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-12 sm:h-14 rounded-2xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-97 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-[#1A1917]/10 shrink-0 min-w-0"
                >
                  <svg className="w-4 h-4 md:w-4.5 md:h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="whitespace-nowrap">Buy Now</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Full-width Product Tabs Section (Overview, Specifications, Shipping & Return, Reviews) */}
        <div className="bg-white border border-[#1E293B]/10 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm mt-10 md:mt-16 space-y-6">
          {/* Tab Selector Header */}
          <div className="flex items-center border-b border-[#1E293B]/10 text-xs sm:text-sm font-extrabold text-[#1E293B]/40 uppercase tracking-widest gap-6 sm:gap-10 overflow-x-auto scrollbar-none pb-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2.5 transition-all relative flex-shrink-0 ${activeTab === "overview" ? "text-[#1E293B] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#3674B5]" : "hover:text-[#1E293B]"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-2.5 transition-all relative flex-shrink-0 ${activeTab === "specs" ? "text-[#1E293B] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#3674B5]" : "hover:text-[#1E293B]"}`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-2.5 transition-all relative flex-shrink-0 ${activeTab === "shipping" ? "text-[#1E293B] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#3674B5]" : "hover:text-[#1E293B]"}`}
            >
              Shipping & Return
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2.5 transition-all relative flex-shrink-0 ${activeTab === "reviews" ? "text-[#1E293B] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#3674B5]" : "hover:text-[#1E293B]"}`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          {/* Tab content view */}
          <div className="min-h-[120px] text-sm sm:text-base text-[#1E293B]/70 leading-relaxed font-semibold">
            {activeTab === "overview" && (
              <p className="animate-fade-in-up">
                {product.description || getDescription(product.id)}
              </p>
            )}
            {activeTab === "specs" && (
              <div className="space-y-3.5 animate-fade-in-up">
                <div className="flex justify-between border-b border-[#1E293B]/10 pb-2">
                  <span className="text-[#1E293B]/40 uppercase text-xs tracking-widest">Model Color</span>
                  <span className="text-[#1E293B]/85 font-extrabold">{product.color}</span>
                </div>
                <div className="flex justify-between border-b border-[#1E293B]/10 pb-2">
                  <span className="text-[#1E293B]/40 uppercase text-xs tracking-widest">Material Finish</span>
                  <span className="text-[#1E293B]/85 font-extrabold">Ultra-premium matte finish</span>
                </div>
                <div className="flex justify-between border-b border-[#1E293B]/10 pb-2">
                  <span className="text-[#1E293B]/40 uppercase text-xs tracking-widest">Warranty Protection</span>
                  <span className="text-[#1E293B]/85 font-extrabold">1 Year Official Warranty</span>
                </div>
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="space-y-3.5 animate-fade-in-up text-sm text-left">
                <div className="flex items-start gap-2.5">
                  <Package className="w-4 h-4 text-[#3674B5] mt-0.5 flex-shrink-0" />
                  <p><strong className="text-[#1E293B]">Standard Free Delivery</strong> on all order totals across India.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-[#3674B5] mt-0.5 flex-shrink-0" />
                  <p><strong className="text-[#1E293B]">Dispatched within 24 hours</strong> from our nearest automated fulfillment center.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#3674B5] mt-0.5 flex-shrink-0" />
                  <p><strong className="text-[#1E293B]">1-Year Brand Warranty</strong> with dedicated customer support.</p>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-6 animate-fade-in-up">
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left animate-fade-in-up">
                    <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Leave a Review</h4>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mr-2">Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setNewRating(starVal)}
                          className="text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-4 h-4 ${newRating >= starVal ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <textarea
                        required
                        placeholder="Write your experience with this premium accessory..."
                        rows={3}
                        className="w-full bg-white border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1E293B] placeholder-slate-350 outline-none focus:border-[#3674B5]"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-black hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center text-xs font-semibold text-slate-500">
                    Please <Link href="/login" className="text-[#3674B5] font-extrabold hover:underline">log in</Link> to write a review.
                  </div>
                )}

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                  {product.reviews && product.reviews.length > 0 ? (
                    [...product.reviews].reverse().map((rev, index) => (
                      <div key={index} className="border-b border-[#1E293B]/10 pb-4 last:border-0 text-left space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{rev.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-650 font-medium leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic font-semibold text-center py-4">No reviews yet. Be the first to leave a review!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="pt-10 md:pt-16 space-y-6 md:space-y-10 border-t border-[#1E293B]/10 mt-10 md:mt-16">
          <div className="space-y-1.5 md:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
              <span className="text-[9px] font-extrabold text-[#3674B5] uppercase tracking-wider">Complete the Setup</span>
            </div>
            <h3 className="font-display font-black text-xl md:text-3xl text-[#1E293B] tracking-tight">
              Related Accessories
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => {
              const specList = p.shortSpec.split(" · ").filter(spec => spec.length < 25 && spec.trim().length > 0);
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/product/${p.id}`)}
                  className="group relative rounded-xl sm:rounded-3xl bg-white border border-[#1E293B]/10 p-2.5 sm:p-4.5 flex flex-col justify-between hover-lift transition-all duration-500 overflow-hidden cursor-pointer shadow-2xs w-full max-w-[300px] mx-auto"
                >
                  <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-[#EAEAEA] overflow-hidden mb-2 sm:mb-3 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1917]/0 to-[#1A1917]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 150px, (max-width: 768px) 250px, 300px"
                      className="object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      style={{
                        filter: "drop-shadow(0 10px 15px rgba(26,25,23,0.06))"
                      }}
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-1.5">
                    <span className="text-[8px] md:text-[9px] font-extrabold text-[#1E293B]/40 uppercase tracking-widest">{p.category}</span>
                    <h4 className="font-display font-bold text-[11px] sm:text-sm md:text-base text-[#1E293B] group-hover:text-[#3674B5] transition-colors line-clamp-1">{p.name}</h4>

                    {/* Hidden on mobile to fit two-column grid cleanly */}
                    <div className="hidden sm:flex flex-wrap gap-1">
                      {specList.slice(0, 2).map((sp, idx) => (
                        <span key={idx} className="text-[8px] sm:text-[9px] font-bold text-[#1E293B]/50 bg-[#F8F9FA] px-1.5 py-0.5 rounded-md">{sp}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]/10 mt-2">
                      <span className="font-black text-[#3674B5] text-xs sm:text-sm md:text-base">₹{p.price.toLocaleString()}</span>
                      <span className="text-[9px] sm:text-xs font-bold text-[#1E293B]/40 group-hover:text-[#1E293B] transition-all flex items-center gap-0.5 md:gap-1">
                        <span>Details</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Available Offers Modal */}
      {isOffersModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto text-left space-y-5">
            <button
              onClick={() => setIsOffersModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-1 pr-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3D6] text-[#B8860B] border border-[#EAE3D2] text-[10px] font-black uppercase tracking-wider">
                <span>🎁 Promotional Savings</span>
              </div>
              <h3 className="font-display font-black text-lg text-[#1E293B]">Available Offers &amp; Coupons</h3>
              <p className="text-xs text-[#1E293B]/50 font-semibold">Copy any code below and paste it during checkout at payment time.</p>
            </div>

            <div className="space-y-3.5 pt-1">
              {(Array.isArray(coupons)
                ? coupons.filter((c) => c.active && (c.applicableCategory === "All" || c.applicableCategory.toLowerCase() === (product?.category || "").toLowerCase()))
                : []).map((c) => (
                <div
                  key={c._id || c.code}
                  className="bg-[#FFFDF7] border border-[#EAE3D2] rounded-2xl p-4 space-y-3 hover:border-[#3674B5]/40 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          {c.badgeType || "Special Offer"}
                        </span>
                        <span className="text-xs font-black text-[#1E293B] uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                          {c.code}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#1E293B] mt-1">{c.title}</h4>
                      {c.description && <p className="text-[11px] font-semibold text-[#1E293B]/60 leading-normal">{c.description}</p>}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-black text-sm text-[#3674B5] block">
                        {c.type === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </span>
                      {c.minPurchase > 0 && (
                        <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                          Min ₹{c.minPurchase}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE3D2]/60">
                    <span className="text-[10px] font-bold text-slate-400">
                      Applicable on {c.applicableCategory === "All" ? "All Items" : c.applicableCategory}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(c.code);
                        } catch (e) {}
                        showToast(`Coupon code "${c.code}" copied! Apply it at checkout during payment.`);
                        setIsOffersModalOpen(false);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Code</span>
                    </button>
                  </div>
                </div>
              ))}

              {(Array.isArray(coupons)
                ? coupons.filter((c) => c.active && (c.applicableCategory === "All" || c.applicableCategory.toLowerCase() === (product?.category || "").toLowerCase()))
                : []).length === 0 && (
                <div className="py-8 text-center text-xs font-semibold text-slate-400 italic">
                  No active promotional coupon offers for this category right now.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal />

      {/* Global Brand Footer */}
      <Footer />
    </div>
  );
}
