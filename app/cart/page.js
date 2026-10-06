"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  Award,
  Sparkles,
  Lock,
  Check
} from "lucide-react";
import Navbar from "../../components/Navbar";
import SearchModal from "../../components/SearchModal";
import CartDrawer from "../../components/CartDrawer";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    coupon,
    discount,
    applyCouponCode,
    removeCoupon,
    getSubtotal,
    clearCart,
    coupons,
    showToast
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [isCouponDropdownOpen, setIsCouponDropdownOpen] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal > 999 ? 0 : subtotal === 0 ? 0 : 99;
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round(taxableAmount * 0.18); // 18% GST
  const grandTotal = taxableAmount + shipping + taxAmount;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyCouponCode(promoInput);
      setPromoInput("");
    }
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      showToast("Your cart is empty. Add products to proceed.", "error");
      return;
    }
    const session = localStorage.getItem("ravtron_session");
    if (!session) {
      showToast("Please log in to proceed to checkout", "error");
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-bg-brand text-text-brand antialiased selection:bg-[#3674B5] selection:text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 relative z-10 w-full flex-grow">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8">
          <button
            onClick={() => router.push("/shop")}
            className="hover:text-[#3674B5] transition-colors flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Shop</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-[#1E293B] font-bold">Shopping Cart Bag</span>
        </div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#1E293B]/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/20 text-[#3674B5] text-[10px] font-black uppercase tracking-wider mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Your Selected Items</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-[#1E293B] tracking-tight">
              Shopping Cart
            </h1>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={clearCart}
                className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
              <span className="bg-[#3674B5] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </div>
          )}
        </div>

        {/* Content Layout */}
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="py-16 sm:py-20 text-center space-y-6 max-w-md mx-auto px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border border-[#1E293B]/10 flex items-center justify-center mx-auto text-[#1E293B]/20 shadow-md">
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#1E293B]">
                Your Shopping Bag is Empty
              </h2>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Explore our catalog of high-performance display cables, multiport docking stations, and enterprise connectivity solutions to populate your bag.
              </p>
            </div>
            <button
              onClick={() => router.push("/shop")}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 hover:scale-105 shadow-lg shadow-[#3674B5]/20 inline-flex items-center gap-2"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Cart Items & Summary Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start pt-4 sm:pt-8">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item, index) => {
                const itemKey = `${item.id || item._id || "item"}-${item.selectedSize || ""}-${item.selectedPrivacySize || ""}-${item.selectedChannel || ""}-${index}`;
                const variantTag =
                  item.selectedSize ||
                  item.selectedPrivacySize ||
                  item.selectedChannel;

                return (
                  <div
                    key={itemKey}
                    className="bg-white border border-[#1E293B]/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4"
                  >
                    {/* Item Image & Description */}
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-[#1E293B]/5 p-1.5 sm:p-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1 text-left">
                        <span className="text-[8px] sm:text-[9px] font-extrabold text-[#3674B5] uppercase tracking-widest bg-[#3674B5]/10 px-2 py-0.5 rounded-full inline-block">
                          {item.category || "Accessory"}
                        </span>
                        <h3 className="font-display font-bold text-xs sm:text-base text-[#1E293B] line-clamp-2 leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">
                          {item.color || item.shortSpec || "Premium finish"}
                          {variantTag ? ` · ${variantTag}` : ""}
                        </p>
                        <div className="text-xs sm:text-sm font-extrabold text-[#3674B5] pt-0.5">
                          ₹{item.price.toLocaleString()}{" "}
                          <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">
                            / each
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Subtotal Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-[#F8F9FA] border border-[#1E293B]/10 rounded-xl px-1.5 py-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, -1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-white text-[#1E293B] font-bold flex items-center justify-center transition-colors text-xs cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="w-7 sm:w-8 text-center font-black text-xs text-[#1E293B]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-white text-[#1E293B] font-bold flex items-center justify-center transition-colors text-xs cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          SUBTOTAL
                        </span>
                        <span className="font-black text-sm sm:text-base text-[#1E293B]">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item)}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded-xl cursor-pointer ml-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Free Delivery Incentive Ribbon */}
              <div className="bg-[#F8F9FA] border border-[#1E293B]/10 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold shrink-0">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    {subtotal >= 999 ? (
                      <p className="font-bold text-[#1E293B] text-xs leading-snug">
                        🎉 You qualify for <span className="text-[#3674B5]">FREE Standard Delivery!</span>
                      </p>
                    ) : (
                      <p className="text-xs leading-snug">
                        Add <span className="font-bold text-[#3674B5]">₹{(999 - subtotal).toLocaleString()}</span> more to unlock <span className="font-bold text-[#1E293B]">Free Shipping</span>.
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="text-xs font-bold text-[#3674B5] hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto"
                >
                  <span>Add More</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-4 text-center">
                <div className="bg-white border border-[#1E293B]/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 space-y-0.5 sm:space-y-1">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#3674B5] mx-auto" />
                  <h4 className="text-[10px] sm:text-xs font-bold text-[#1E293B]">100% Authentic</h4>
                  <p className="text-[8px] sm:text-[10px] font-semibold text-slate-400">Genuine RAVTRON®</p>
                </div>
                <div className="bg-white border border-[#1E293B]/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 space-y-0.5 sm:space-y-1">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#3674B5] mx-auto" />
                  <h4 className="text-[10px] sm:text-xs font-bold text-[#1E293B]">Fast Dispatch</h4>
                  <p className="text-[8px] sm:text-[10px] font-semibold text-slate-400">Ships in 24 Hours</p>
                </div>
                <div className="bg-white border border-[#1E293B]/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 space-y-0.5 sm:space-y-1">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#3674B5] mx-auto" />
                  <h4 className="text-[10px] sm:text-xs font-bold text-[#1E293B]">1-Year Warranty</h4>
                  <p className="text-[8px] sm:text-[10px] font-semibold text-slate-400">Official Coverage</p>
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <h3 className="font-display font-black text-lg text-[#1E293B] border-b border-[#1E293B]/10 pb-4">
                  Order Summary
                </h3>

                {/* Promo Code Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Promotional Coupon Code
                  </label>
                  {coupon ? (
                    <div className="flex items-center justify-between bg-[#3674B5]/10 border border-[#3674B5]/40 rounded-xl px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#3674B5]" />
                        <span className="text-xs font-bold text-[#3674B5]">
                          Code "{coupon}" Active
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs text-rose-600 hover:underline font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <form onSubmit={handleApplyPromo} className="flex gap-2 min-w-0 w-full">
                        <input
                          type="text"
                          placeholder="e.g. WELCOME100"
                          className="flex-1 min-w-0 w-full bg-[#F8F9FA] border border-[#1E293B]/15 rounded-xl px-3 sm:px-3.5 py-2.5 text-xs font-semibold text-[#1E293B] outline-none placeholder-slate-400 focus:bg-white focus:border-[#3674B5]"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer shrink-0"
                        >
                          Apply
                        </button>
                      </form>

                      {/* Custom Dropdown for existing active coupon offers */}
                      {Array.isArray(coupons) && coupons.filter((c) => c.active).length > 0 && (
                        <div className="relative w-full min-w-0">
                          <button
                            type="button"
                            onClick={() => setIsCouponDropdownOpen(!isCouponDropdownOpen)}
                            className="w-full bg-[#FFFDF7] border border-[#EAE3D2] hover:border-[#3674B5]/40 rounded-xl px-3 py-2.5 text-xs font-bold text-[#1E293B] flex items-center justify-between shadow-2xs transition-all cursor-pointer"
                          >
                            <span className="truncate flex items-center gap-1.5 min-w-0 pr-2">
                              <span>🏷️</span>
                              <span className="truncate">Select coupon ({coupons.filter((c) => c.active).length} available)</span>
                            </span>
                            <span className={`text-[10px] text-slate-400 transition-transform duration-200 shrink-0 ${isCouponDropdownOpen ? "rotate-180" : ""}`}>
                              ▼
                            </span>
                          </button>

                          {isCouponDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#1E293B]/10 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 max-h-60 overflow-y-auto animate-fade-in-up">
                              {coupons
                                .filter((c) => c.active)
                                .map((c) => {
                                  const discountText = c.type === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`;
                                  const minText = c.minPurchase > 0 ? `Min ₹${c.minPurchase}` : null;
                                  return (
                                    <button
                                      key={c._id || c.code}
                                      type="button"
                                      onClick={() => {
                                        applyCouponCode(c.code);
                                        setIsCouponDropdownOpen(false);
                                      }}
                                      className="w-full text-left p-2 rounded-xl hover:bg-[#3674B5]/5 border border-transparent hover:border-[#3674B5]/20 transition-all flex flex-col gap-0.5 group cursor-pointer"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-extrabold text-[#3674B5] group-hover:text-[#578FCA]">
                                          [{c.code}]
                                        </span>
                                        <span className="text-[9px] font-black bg-[#3674B5] text-white px-2 py-0.5 rounded-full shrink-0">
                                          {discountText}
                                        </span>
                                      </div>
                                      <div className="text-[10px] font-semibold text-slate-500 truncate flex items-center gap-1">
                                        <span>{c.title || "Special Deal"}</span>
                                        {minText && <span>· {minText}</span>}
                                      </div>
                                    </button>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Breakdown List */}
                <div className="space-y-3.5 text-xs font-semibold text-slate-600 border-t border-[#1E293B]/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-[#1E293B]">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-[#3674B5]">
                      <span>Discount Coupon</span>
                      <span className="font-bold">– ₹{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-[#1E293B]">
                      {shipping === 0 ? (
                        <span className="text-[#3674B5] font-black uppercase text-[10px]">
                          Free
                        </span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Estimated GST Tax (18%)</span>
                    <span className="font-bold text-[#1E293B]">
                      ₹{taxAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-[#1E293B]/10 pt-4 flex justify-between items-center text-base font-bold text-[#1E293B]">
                    <span>Total Amount</span>
                    <span className="font-black text-xl text-[#3674B5]">
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Main Action CTAs */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-4 rounded-2xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#3674B5]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Checkout</span>
                  </button>

                  <button
                    onClick={() => router.push("/shop")}
                    className="w-full py-3.5 rounded-2xl border border-[#1E293B]/10 hover:bg-[#F8F9FA] text-[#1E293B] text-xs font-extrabold uppercase tracking-widest transition-all text-center block"
                  >
                    Continue Shopping
                  </button>
                </div>

                <p className="text-[9px] text-center text-slate-400 font-semibold leading-normal pt-2">
                  🔒 Encrypted checkout tunnel. Taxes calculated based on destination postal state.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <SearchModal />
    </div>
  );
}
