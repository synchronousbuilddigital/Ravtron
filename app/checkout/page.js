"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import {
  CreditCard,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  User,
  Lock,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Percent,
  Truck,
  Check,
  Edit2,
  Tag,
  Plus,
  Trash2,
  Home,
  Building2
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import CartDrawer from "../../components/CartDrawer";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, coupon, discount, applyCouponCode, removeCoupon, getSubtotal, clearCart, showToast, coupons } = useCart();
  const [checkoutPromoInput, setCheckoutPromoInput] = useState("");
  const [isCouponDropdownOpen, setIsCouponDropdownOpen] = useState(false);

  // Steps control
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Contact, Step 2: Shipping, Step 3: Payment

  // Checkout flow states
  const [currentUser, setCurrentUser] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [shippingForm, setShippingForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India"
  });

  // Saved Addresses State & Controls
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    tag: "Home",
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India"
  });

  const [deliveryPref, setDeliveryPref] = useState("standard"); // "standard" or "express"
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card", "upi", "netbanking"

  // Card Inputs
  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });

  // UPI Input
  const [upiId, setUpiId] = useState("");

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState("sbi");

  // Real payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // null | "success" | "failure"
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentError, setPaymentError] = useState("");

  // Address selection helper
  const handleSelectSavedAddress = (addr) => {
    if (!addr) return;
    setSelectedAddressId(addr.id);
    setIsAddingNewAddress(false);
    setShippingForm({
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || "",
      country: addr.country || "India"
    });
    if (addr.name || addr.phone) {
      setContactForm((prev) => ({
        ...prev,
        name: addr.name || prev.name,
        phone: addr.phone || prev.phone
      }));
    }
  };

  const handleDeleteSavedAddress = (e, addrId) => {
    e.stopPropagation();
    const updated = savedAddresses.filter((a) => a.id !== addrId);
    setSavedAddresses(updated);
    localStorage.setItem("ravtron_saved_addresses", JSON.stringify(updated));
    showToast("Address removed", "info");
    if (selectedAddressId === addrId) {
      if (updated.length > 0) {
        handleSelectSavedAddress(updated[0]);
      } else {
        setSelectedAddressId(null);
        setIsAddingNewAddress(true);
      }
    }
  };

  const [isFetchingPin, setIsFetchingPin] = useState(false);

  const handlePincodeLookup = async (pincodeVal, targetForm = "new") => {
    const cleanPin = pincodeVal.replace(/\D/g, "");
    if (cleanPin.length === 6) {
      setIsFetchingPin(true);
      try {
        const res = await fetch(`/api/pincode/${cleanPin}`);
        const data = await res.json();
        if (data.success && (data.city || data.state)) {
          const detectedCity = data.city || "";
          const detectedState = data.state || "";

          if (targetForm === "new") {
            setNewAddressForm((prev) => ({
              ...prev,
              city: detectedCity,
              state: detectedState
            }));
          } else if (targetForm === "shipping") {
            setShippingForm((prev) => ({
              ...prev,
              city: detectedCity,
              state: detectedState
            }));
          }
          showToast(`Auto-detected: ${detectedCity}, ${detectedState}`);
        }
      } catch (e) {
        console.error("PIN code lookup error", e);
      } finally {
        setIsFetchingPin(false);
      }
    }
  };

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newAddressForm.street || !newAddressForm.city || !newAddressForm.state || !newAddressForm.zip) {
      showToast("Please fill in all required address fields", "error");
      return;
    }

    const newId = "addr_" + Date.now();
    const newAddrObj = {
      id: newId,
      tag: newAddressForm.tag || "Home",
      name: newAddressForm.name || contactForm.name || currentUser?.name || "Customer",
      phone: newAddressForm.phone || contactForm.phone || "",
      street: newAddressForm.street,
      city: newAddressForm.city,
      state: newAddressForm.state,
      zip: newAddressForm.zip,
      country: newAddressForm.country || "India"
    };

    const updatedList = [...savedAddresses, newAddrObj];
    setSavedAddresses(updatedList);
    localStorage.setItem("ravtron_saved_addresses", JSON.stringify(updatedList));

    handleSelectSavedAddress(newAddrObj);
    setIsAddingNewAddress(false);
    setNewAddressForm({
      tag: "Home",
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "India"
    });
    showToast("New delivery address saved!");
  };

  // Load user details and addresses
  useEffect(() => {
    const initCheckoutAuth = async () => {
      let parsedUser = null;
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.isLoggedIn && data.user) {
          parsedUser = data.user;
          localStorage.setItem("ravtron_session", JSON.stringify(data.user));
        } else {
          const session = localStorage.getItem("ravtron_session");
          if (session) {
            try { parsedUser = JSON.parse(session); } catch (e) {}
          }
        }
      } catch (e) {
        const session = localStorage.getItem("ravtron_session");
        if (session) {
          try { parsedUser = JSON.parse(session); } catch (err) {}
        }
      }

      if (!parsedUser) {
        showToast("Please log in to checkout", "error");
        router.push("/login");
        return;
      }

      setCurrentUser(parsedUser);
      const initialName = parsedUser.name || "";
      const initialPhone = parsedUser.phone || "";
      setContactForm({
        name: initialName,
        email: parsedUser.email || "",
        phone: initialPhone
      });

      setNewAddressForm((prev) => ({
        ...prev,
        name: initialName,
        phone: initialPhone
      }));

      // 1. Load saved address list from localStorage
      let list = [];
      const storedList = localStorage.getItem("ravtron_saved_addresses");
      if (storedList) {
        try {
          list = JSON.parse(storedList);
        } catch (e) {
          console.error("Failed to parse saved addresses", e);
        }
      }

      // 2. Fallback: Check single ravtron_address if list is empty
      const singleAddr = localStorage.getItem("ravtron_address");
      if (list.length === 0 && singleAddr) {
        try {
          const parsedSingle = JSON.parse(singleAddr);
          if (parsedSingle.street) {
            const defaultAddr = {
              id: "addr_default",
              tag: "Home",
              name: initialName || "Default Address",
              phone: initialPhone,
              street: parsedSingle.street || "",
              city: parsedSingle.city || "",
              state: parsedSingle.state || "",
              zip: parsedSingle.zip || "",
              country: parsedSingle.country || "India"
            };
            list = [defaultAddr];
            localStorage.setItem("ravtron_saved_addresses", JSON.stringify(list));
          }
        } catch (e) {
          console.error("Failed to parse single address data", e);
        }
      }

      setSavedAddresses(list);

      if (list.length > 0) {
        handleSelectSavedAddress(list[0]);
      } else {
        setIsAddingNewAddress(true);
      }

      // Auto-advance to Step 2 (Shipping Address) if user contact info is pre-filled
      if (initialName && parsedUser.email) {
        setCurrentStep(2);
      }
    };

    initCheckoutAuth();
  }, []);

  // Validation functions for each step
  const validateStep1 = () => {
    if (!contactForm.name.trim()) {
      showToast("Please enter your name.", "error");
      return false;
    }
    if (!contactForm.email.trim() || !contactForm.email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return false;
    }
    // Minimal phone number digits check
    const digits = contactForm.phone.replace(/\D/g, "");
    if (!contactForm.phone.trim() || digits.length < 10) {
      showToast("Please enter a valid 10-digit phone number.", "error");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    // Case 1: User is filling in a new address form
    if (isAddingNewAddress) {
      if (!newAddressForm.street || !newAddressForm.street.trim()) {
        showToast("Please enter your street address.", "error");
        return false;
      }
      if (!newAddressForm.city || !newAddressForm.city.trim()) {
        showToast("Please enter your city.", "error");
        return false;
      }
      if (!newAddressForm.state || !newAddressForm.state.trim()) {
        showToast("Please enter your state.", "error");
        return false;
      }
      const pinDigits = (newAddressForm.zip || "").replace(/\D/g, "");
      if (!newAddressForm.zip || !newAddressForm.zip.trim() || pinDigits.length < 5) {
        showToast("Please enter a valid postal code.", "error");
        return false;
      }
      if (newAddressForm.phone && newAddressForm.phone.replace(/\D/g, "").length < 10) {
        showToast("Please enter a valid 10-digit phone number.", "error");
        return false;
      }

      // Auto-save this address and select it for checkout
      const newId = "addr_" + Date.now();
      const newAddrObj = {
        id: newId,
        tag: newAddressForm.tag || "Home",
        name: newAddressForm.name || contactForm.name || currentUser?.name || "Customer",
        phone: newAddressForm.phone || contactForm.phone || "",
        street: newAddressForm.street.trim(),
        city: newAddressForm.city.trim(),
        state: newAddressForm.state.trim(),
        zip: newAddressForm.zip.trim(),
        country: newAddressForm.country || "India"
      };

      const updatedList = [...savedAddresses, newAddrObj];
      setSavedAddresses(updatedList);
      localStorage.setItem("ravtron_saved_addresses", JSON.stringify(updatedList));

      handleSelectSavedAddress(newAddrObj);
      setIsAddingNewAddress(false);
      return true;
    }

    // Case 2: User has a saved address selected
    if (!shippingForm.street || !shippingForm.street.trim()) {
      showToast("Please select or enter a delivery address.", "error");
      return false;
    }
    if (!shippingForm.city || !shippingForm.city.trim()) {
      showToast("Please enter your city.", "error");
      return false;
    }
    if (!shippingForm.state || !shippingForm.state.trim()) {
      showToast("Please enter your state.", "error");
      return false;
    }
    const pinDigits = (shippingForm.zip || "").replace(/\D/g, "");
    if (!shippingForm.zip || !shippingForm.zip.trim() || pinDigits.length < 5) {
      showToast("Please enter a valid postal code.", "error");
      return false;
    }
    return true;
  };

  // Step Navigations
  const handleContinueToShipping = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  // Form Input Helpers
  const handleContactChange = (e) => {
    let val = e.target.value;
    if (e.target.name === "phone") {
      val = val.replace(/\D/g, "").slice(0, 10);
    }
    setContactForm({ ...contactForm, [e.target.name]: val });
  };

  const handleShippingChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    let val = e.target.value;
    if (e.target.name === "number") {
      val = val.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim();
      if (val.length > 19) return;
    }
    if (e.target.name === "expiry") {
      val = val.replace(/\D/g, "");
      if (val.length > 2) {
        val = val.substring(0, 2) + "/" + val.substring(2, 4);
      }
      if (val.length > 5) return;
    }
    if (e.target.name === "cvv") {
      val = val.replace(/\D/g, "");
      if (val.length > 3) return;
    }
    setCardForm({ ...cardForm, [e.target.name]: val });
  };

  // Pricing calculations
  const subtotal = getSubtotal();
  const deliveryCharge = deliveryPref === "express" ? 199 : subtotal > 999 ? 0 : 99;
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round(taxableAmount * 0.18); // 18% GST
  const grandTotal = taxableAmount + deliveryCharge + taxAmount;

  // ─── Load Razorpay checkout.js SDK dynamically ──────────────────────────
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ─── Razorpay: open popup and handle real payment ─────────────────────────
  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setPaymentError("");

    // 1. Dynamically load Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setIsProcessing(false);
      showToast("Failed to load payment gateway. Check your internet connection.", "error");
      return;
    }

    try {
      // 2. Create a Razorpay order on the server
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send items so the server can recalculate the true amount from DB prices
          items: cart.map(item => ({
            productId: item.id,
            selectedSize: item.selectedSize || null,
            qty: item.quantity
          })),
          deliveryPref,
          currency: "INR",
          customerEmail: contactForm.email,
          notes: {
            customerName: contactForm.name,
            customerPhone: contactForm.phone
          }
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Could not initiate payment");

      const { razorpay_order_id, amount, currency } = createData;

      // 3. Open Razorpay checkout popup
      const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "RAVTRON®",
        description: `Order of ${cart.length} item(s)`,
        image: "/logo-192.png", // Brand logo shown inside the Razorpay popup
        order_id: razorpay_order_id,
        theme: { color: "#3674B5" }, // RAVTRON brand blue
        prefill: {
          name: contactForm.name,
          email: contactForm.email,
          contact: contactForm.phone
        },
        // Which payment methods to show
        config: {
          display: {
            blocks: {
              utib: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
              other: { name: "Other Payment Modes", instruments: [{ method: "card" }, { method: "netbanking" }, { method: "wallet" }] }
            },
            sequence: ["block.utib", "block.other"],
            preferences: { show_default_blocks: false }
          }
        },
        // ── Success handler ────────────────────────────────────────────────
        handler: async (response) => {
          const { razorpay_payment_id, razorpay_order_id: rpOrderId, razorpay_signature } = response;

          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: rpOrderId,
                razorpay_payment_id,
                razorpay_signature,
                orderData: {
                  customerName: contactForm.name,
                  customerEmail: contactForm.email,
                  customerPhone: contactForm.phone,
                  shippingAddress: shippingForm,
                  deliveryPref,
                  paymentMethod: paymentMethod.toUpperCase(),
                  coupon: coupon || "",
                  items: cart.map(item => ({
                    productId: item.id,
                    selectedSize: item.selectedSize || null,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    qty: item.quantity
                  }))
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

            localStorage.setItem("ravtron_address", JSON.stringify(shippingForm));
            setCreatedOrder(verifyData.order);
            setPaymentResult("success");
            clearCart();
            showToast("Payment Successful! Order Confirmed.", "success");
          } catch (verifyErr) {
            console.error("[PAYMENT] Verify error:", verifyErr);
            setPaymentError(verifyErr.message || "Payment captured but order confirmation failed. Contact support.");
            setPaymentResult("failure");
            showToast(verifyErr.message || "Order confirmation failed", "error");
          } finally {
            setIsProcessing(false);
          }
        },
        // ── Modal dismissed / payment cancelled ────────────────────────────
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            showToast("Payment cancelled. You can try again.", "info");
          }
        }
      };

      // Open the Razorpay checkout window
      const rzp = new window.Razorpay(razorpayOptions);

      rzp.on("payment.failed", (response) => {
        console.error("[RAZORPAY] Payment failed:", response.error);
        setIsProcessing(false);
        setPaymentError(response.error?.description || "Payment failed. Please try again.");
        setPaymentResult("failure");
        showToast(response.error?.description || "Payment failed", "error");
      });

      rzp.open();
    } catch (err) {
      console.error("[PAYMENT] Gateway error:", err);
      setIsProcessing(false);
      setPaymentError(err.message || "Payment initiation failed. Please try again.");
      showToast(err.message || "Payment failed to initiate", "error");
    }
  };

  // ─── Main submit handler ──────────────────────────────────────────────────
  const handleFinalSubmit = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast("Your cart is empty. Add products to proceed.", "error");
      return;
    }

    if (!validateStep1()) { setCurrentStep(1); return; }
    if (!validateStep2()) { setCurrentStep(2); return; }

    handleRazorpayPayment();
  };

  const resetFailureState = () => {
    setPaymentResult(null);
    setIsProcessing(false);
    setPaymentError("");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-bg-brand flex items-center justify-center text-xs font-bold text-slate-500 uppercase tracking-widest">
        Loading Secure Checkout tunnel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-brand text-text-brand antialiased selection:bg-[#3674B5] selection:text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 pb-24 relative z-10 w-full flex-grow">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <button onClick={() => router.push("/shop")} className="hover:text-[#3674B5] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shop</span>
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1E293B] font-bold">Checkout</span>
        </div>

        {paymentResult === "success" && createdOrder ? (
          /* Success Screen */
          <div className="max-w-2xl mx-auto bg-white border border-[#1E293B]/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center space-y-8 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1E293B] tracking-tight">Order Confirmed!</h2>
              <p className="text-sm font-semibold text-slate-600 max-w-md mx-auto">
                Thank you for your purchase. Your payment was verified securely, and your order has been registered in the dashboard queue.
              </p>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl border border-[#1E293B]/5 p-6 text-left space-y-4 max-w-lg mx-auto">
              <div className="flex justify-between items-center text-xs border-b border-[#1E293B]/5 pb-3 font-semibold text-[#1E293B]">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Order ID</p>
                  <p className="font-black text-[#3674B5] text-sm mt-0.5">{createdOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Date</p>
                  <p className="font-bold mt-0.5">{createdOrder.date}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Delivery Details</p>
                <div className="text-xs font-semibold text-slate-700 space-y-1">
                  <p className="font-bold text-[#1E293B]">{createdOrder.customerName}</p>
                  <p>{createdOrder.shippingAddress.street}</p>
                  <p>{createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.state} - {createdOrder.shippingAddress.zip}</p>
                  <p className="text-[#3674B5] font-bold mt-2">
                    Method: {createdOrder.deliveryPref === "express" ? "Express Priority (1-2 Days)" : "Standard Shipping (3-5 Days)"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#1E293B]/5 text-xs font-bold text-[#1E293B]">
                <span className="text-[#1E293B]/40 uppercase tracking-wider text-[10px]">Total Paid</span>
                <span className="font-black text-sm text-[#3674B5]">₹{createdOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 max-w-sm mx-auto">
              <button
                onClick={() => router.push("/profile")}
                className="w-full py-3.5 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-[#3674B5]/10"
              >
                Track in Dashboard
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="w-full py-3.5 rounded-xl border border-[#1E293B]/10 hover:bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-[#1E293B]/70 hover:text-[#1E293B] transition-all bg-white"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Forms Column */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Steps Column */}
            <div className="lg:col-span-8 space-y-6">

              {/* STEP 1: CONTACT DETAILS */}
              <div className={`bg-white border rounded-3xl p-6 md:p-8 transition-all ${currentStep === 1
                  ? "border-[#3674B5] shadow-md"
                  : currentStep > 1
                    ? "border-[#1E293B]/10 opacity-95"
                    : "border-[#1E293B]/10 opacity-50"
                }`}>
                {/* Header Row */}
                <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]/5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-xs ${currentStep > 1
                        ? "bg-emerald-500 text-white"
                        : "bg-[#3674B5]/10 text-[#3674B5]"
                      }`}>
                      {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-base md:text-lg text-[#1E293B]">Contact Details</h3>
                      <p className="text-[10px] md:text-xs font-semibold text-[#1E293B]/40">For sending shipping tracker credentials and invoice receipts.</p>
                    </div>
                  </div>
                  {currentStep > 1 && (
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-[#3674B5] hover:text-[#578FCA] text-xs font-extrabold flex items-center gap-1 hover:underline"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Collapsed summary when completed */}
                {currentStep > 1 ? (
                  <div className="text-xs font-semibold text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Name</span>
                      <span className="font-black text-[#1E293B]">{contactForm.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Email</span>
                      <span className="font-black text-[#1E293B]">{contactForm.email}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Phone</span>
                      <span className="font-black text-[#1E293B]">{contactForm.phone}</span>
                    </div>
                  </div>
                ) : (
                  /* Expanded Inputs Form */
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 w-4 h-4 text-[#1E293B]/30" />
                          <input
                            type="text"
                            required
                            name="name"
                            placeholder="Your full name"
                            className="w-full bg-[#F8F9FA] border border-[#1E293B]/10 rounded-xl pl-11 pr-4 py-3.5 text-xs font-semibold text-[#1E293B] placeholder-slate-400 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                            value={contactForm.name}
                            onChange={handleContactChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#1E293B]/30" />
                          <input
                            type="email"
                            required
                            name="email"
                            placeholder="name@company.com"
                            className="w-full bg-[#F8F9FA] border border-[#1E293B]/10 rounded-xl pl-11 pr-4 py-3.5 text-xs font-semibold text-[#1E293B] placeholder-slate-400 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                            value={contactForm.email}
                            onChange={handleContactChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 w-4 h-4 text-[#1E293B]/30" />
                          <input
                            type="tel"
                            required
                            name="phone"
                            maxLength={10}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            placeholder="10-digit mobile number"
                            className="w-full bg-[#F8F9FA] border border-[#1E293B]/10 rounded-xl pl-11 pr-4 py-3.5 text-xs font-semibold text-[#1E293B] placeholder-slate-400 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                            value={contactForm.phone}
                            onChange={handleContactChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleContinueToShipping}
                        className="px-6 py-3 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Continue to Shipping</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: SHIPPING ADDRESS */}
              <div className={`bg-white border rounded-3xl p-6 md:p-8 transition-all ${currentStep === 2
                  ? "border-[#3674B5] shadow-md"
                  : currentStep > 2
                    ? "border-[#1E293B]/10 opacity-95"
                    : "border-[#1E293B]/10 opacity-50"
                }`}>
                {/* Header Row */}
                <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]/5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-xs ${currentStep > 2
                        ? "bg-emerald-500 text-white"
                        : "bg-[#3674B5]/10 text-[#3674B5]"
                      }`}>
                      {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
                    </div>
                    <div>
                      <h3 className={`font-display font-black text-base md:text-lg text-[#1E293B] ${currentStep < 2 ? "text-slate-400" : ""}`}>Shipping Address</h3>
                      <p className="text-[10px] md:text-xs font-semibold text-slate-500">Specify physical destination coordinates for priority shipping dispatch.</p>
                    </div>
                  </div>
                  {currentStep > 2 && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-[#3674B5] hover:text-[#578FCA] text-xs font-extrabold flex items-center gap-1 hover:underline"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Collapsed summary when completed */}
                {currentStep > 2 ? (
                  <div className="text-xs font-semibold text-slate-700 pt-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Delivery Address</span>
                    <span className="font-black text-[#1E293B]">
                      {shippingForm.street}, {shippingForm.city}, {shippingForm.state} - {shippingForm.zip}, {shippingForm.country}
                    </span>
                  </div>
                ) : currentStep === 2 ? (
                  <div className="space-y-6">
                    {!isAddingNewAddress && savedAddresses.length > 0 ? (
                      /* Saved Address Cards List */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-black text-[#1E293B] uppercase tracking-wider">
                            Select Delivery Address ({savedAddresses.length})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setNewAddressForm((prev) => ({
                                ...prev,
                                name: contactForm.name || currentUser?.name || "",
                                phone: contactForm.phone || currentUser?.phone || ""
                              }));
                              setIsAddingNewAddress(true);
                            }}
                            className="text-xs font-bold text-[#3674B5] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Address</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedAddresses.map((addr) => {
                            const isSelected = addr.id === selectedAddressId;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => handleSelectSavedAddress(addr)}
                                className={`rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-3 relative ${
                                  isSelected
                                    ? "border-[#3674B5] bg-[#3674B5]/5 shadow-sm"
                                    : "border-slate-200/70 bg-[#F8F9FA] hover:border-slate-300"
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        isSelected ? "border-[#3674B5] bg-[#3674B5]" : "border-slate-400 bg-white"
                                      }`}>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                      </div>
                                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 tracking-wider">
                                        {addr.tag || "Home"}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteSavedAddress(e, addr.id)}
                                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-50"
                                      title="Remove Address"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="pt-1">
                                    <h4 className="font-bold text-xs text-[#1E293B]">{addr.name}</h4>
                                    <p className="text-[11px] font-semibold text-slate-500 leading-relaxed mt-0.5">
                                      {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                                    </p>
                                    {addr.phone && (
                                      <p className="text-[10px] font-bold text-slate-400 mt-1">
                                        📞 {addr.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                                    isSelected ? "text-[#3674B5]" : "text-slate-400"
                                  }`}>
                                    {isSelected ? "✓ Deliver Here" : "Click to Select"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Button to add another address */}
                        <button
                          type="button"
                          onClick={() => {
                            setNewAddressForm((prev) => ({
                              ...prev,
                              name: contactForm.name || currentUser?.name || "",
                              phone: contactForm.phone || currentUser?.phone || ""
                            }));
                            setIsAddingNewAddress(true);
                          }}
                          className="w-full py-3 rounded-2xl border-2 border-dashed border-[#3674B5]/30 hover:border-[#3674B5] text-[#3674B5] hover:bg-[#3674B5]/5 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Deliver to a Different Address</span>
                        </button>
                      </div>
                    ) : (
                      /* New / Edit Address Form */
                      <form onSubmit={handleSaveNewAddress} className="space-y-4 bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                          <h4 className="font-bold text-xs text-[#1E293B] uppercase tracking-wider">
                            Add New Delivery Address
                          </h4>
                          {savedAddresses.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setIsAddingNewAddress(false)}
                              className="text-xs text-slate-500 font-bold hover:text-slate-900"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        {/* Tag pills */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Address Type</label>
                          <div className="flex gap-2">
                            {["Home", "Work", "Other"].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setNewAddressForm({ ...newAddressForm, tag })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                  newAddressForm.tag === tag
                                    ? "bg-[#3674B5] text-white border-[#3674B5]"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Recipient Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Full Name"
                              className="w-full bg-white border border-[#1E293B]/10 rounded-xl px-4 py-3 text-xs font-semibold text-[#1E293B] outline-none focus:border-[#3674B5]"
                              value={newAddressForm.name}
                              onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Phone Number</label>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              inputMode="numeric"
                              pattern="[0-9]{10}"
                              placeholder="10-digit mobile number"
                              className="w-full bg-white border border-[#1E293B]/10 rounded-xl px-4 py-3 text-xs font-semibold text-[#1E293B] outline-none focus:border-[#3674B5]"
                              value={newAddressForm.phone}
                              onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Street Address</label>
                          <input
                            type="text"
                            required
                            placeholder="Flat/House No, Building, Street name"
                            className="w-full bg-white border border-[#1E293B]/10 rounded-xl px-4 py-3 text-xs font-semibold text-[#1E293B] outline-none focus:border-[#3674B5]"
                            value={newAddressForm.street}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">City</label>
                            <input
                              type="text"
                              required
                              placeholder="City"
                              className="w-full bg-white border border-[#1E293B]/10 rounded-xl px-4 py-3 text-xs font-semibold text-[#1E293B] outline-none focus:border-[#3674B5]"
                              value={newAddressForm.city}
                              onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">State</label>
                            <input
                              type="text"
                              required
                              placeholder="State"
                              className="w-full bg-white border border-[#1E293B]/10 rounded-xl px-4 py-3 text-xs font-semibold text-[#1E293B] outline-none focus:border-[#3674B5]"
                              value={newAddressForm.state}
                              onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">PIN Code</label>
                              {isFetchingPin && <span className="text-[9px] font-bold text-[#3674B5] animate-pulse">Detecting...</span>}
                            </div>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              inputMode="numeric"
                              pattern="[0-9]{6}"
                              placeholder="6-digit PIN"
                              className="w-full bg-white border border-[#1E293B]/10 rounded-xl px-4 py-3 text-xs font-semibold text-[#1E293B] outline-none focus:border-[#3674B5]"
                              value={newAddressForm.zip}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setNewAddressForm({ ...newAddressForm, zip: val });
                                handlePincodeLookup(val, "new");
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider shadow-xs cursor-pointer"
                          >
                            Save & Deliver Here
                          </button>
                          {savedAddresses.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setIsAddingNewAddress(false)}
                              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    )}

                    {/* Step Navigation Actions */}
                    <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-3 pt-3 border-t border-[#1E293B]/5">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-extrabold text-slate-500 hover:text-[#1E293B] transition-all flex items-center justify-center gap-1 py-2 xs:py-0"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Contact</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleContinueToPayment}
                        className="w-full xs:w-auto px-4 sm:px-6 py-3 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                      >
                        <span>Continue to Payment</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>



              {/* STEP 3: PAYMENT INFORMATION */}
              <div className={`bg-white border rounded-3xl p-6 md:p-8 transition-all ${currentStep === 3
                  ? "border-[#3674B5] shadow-md"
                  : "border-[#1E293B]/10 opacity-50"
                }`}>
                {/* Header Row */}
                <div className="flex items-center gap-3 pb-4 border-b border-[#1E293B]/5 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-display font-black text-xs">3</div>
                  <div>
                    <h3 className={`font-display font-black text-base md:text-lg text-[#1E293B] ${currentStep < 3 ? "text-slate-400" : ""}`}>Payment Information</h3>
                    <p className="text-[10px] md:text-xs font-semibold text-slate-500">100% Secure encrypted online payment via Razorpay.</p>
                  </div>
                </div>

                {currentStep === 3 ? (
                  /* Expanded Inputs Form */
                  <div className="space-y-6">
                    {/* Horizontal Payment Selectors */}
                    <div className="grid grid-cols-3 gap-2.5 border-b border-[#1E293B]/5 pb-4">
                      {[
                        { id: "card", label: "Card", desc: "Credit / Debit" },
                        { id: "upi", label: "UPI", desc: "Instant Pay / QR" },
                        { id: "netbanking", label: "Banking", desc: "Net Banking / Wallets" }
                      ].map((pay) => (
                        <button
                          key={pay.id}
                          type="button"
                          onClick={() => setPaymentMethod(pay.id)}
                          className={`px-2.5 py-3 rounded-xl border transition-all text-center flex flex-col justify-center items-center gap-0.5 ${paymentMethod === pay.id
                              ? "bg-[#3674B5] text-white border-[#3674B5] shadow-xs"
                              : "bg-[#F8F9FA] text-slate-700 border-[#1E293B]/10 hover:border-[#1E293B]/25 hover:bg-slate-50"
                            }`}
                        >
                          <span className="text-xs font-bold">{pay.label}</span>
                          <span className={`text-[8px] font-semibold ${paymentMethod === pay.id ? "text-white/80" : "text-slate-500"}`}>{pay.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Razorpay Trust Information Panel */}
                    <div className="pt-2 animate-fade-in-up">
                      <div className="bg-[#3674B5]/5 border border-[#3674B5]/20 rounded-2xl p-4 max-w-lg flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#3674B5] mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold text-[#1E293B]">
                            Secured by Razorpay
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">
                            Your payment details are entered securely inside the official Razorpay checkout window — we never see or store your card or UPI credentials. Supports Cards, UPI, Net Banking, and Wallets.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#1E293B]/5">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-extrabold text-slate-500 hover:text-[#1E293B] transition-all flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleFinalSubmit}
                        disabled={isProcessing}
                        className="px-6 py-3 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Processing...</span></>
                        ) : (
                          <><Lock className="w-3.5 h-3.5" /><span>Pay with Razorpay</span></>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

            </div>

            {/* Right Sticky Order Summary Column */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">

              <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-6 shadow-xs space-y-6">
                <div className="border-b border-[#1E293B]/5 pb-4">
                  <h3 className="font-display font-black text-base text-[#1E293B]">Order Summary</h3>
                </div>

                {/* Items loop */}
                <div className="space-y-4 max-h-60 overflow-y-auto pr-1 text-left">
                  {cart.length > 0 ? (
                    cart.map((item, index) => {
                      const itemKey = `${item.id || item._id || "item"}-${item.selectedSize || ""}-${item.selectedPrivacySize || ""}-${item.selectedChannel || ""}-${index}`;
                      return (
                        <div key={itemKey} className="flex items-center gap-3 text-xs font-semibold text-[#1E293B]">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#1E293B]/5 p-0.5 flex-shrink-0 flex items-center justify-center">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-black text-[11px] leading-tight text-[#1E293B] truncate">{item.name}</h4>
                            <p className="text-[9px] text-slate-500 font-bold mt-0.5">Qty: {item.quantity}{item.selectedSize ? ` · Size: ${item.selectedSize}` : ''} · ₹{item.price.toLocaleString()}</p>
                          </div>
                          <span className="font-black text-[#1E293B]/90 pl-1">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 font-semibold text-center py-4">No products in cart.</p>
                  )}
                </div>

                {/* Promo / Coupon Code Input (Checkout & Payment Time) */}
                <div className="border-t border-[#1E293B]/5 pt-4 text-left">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-[#3674B5]/10 border border-[#3674B5]/40 rounded-xl px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#3674B5]" />
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
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (checkoutPromoInput.trim()) {
                            applyCouponCode(checkoutPromoInput);
                            setCheckoutPromoInput("");
                          }
                        }}
                        className="flex gap-2 min-w-0 w-full"
                      >
                        <input
                          type="text"
                          placeholder="Enter Promo Code"
                          className="flex-1 min-w-0 w-full bg-[#F8F9FA] border border-[#1E293B]/15 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-semibold text-[#1E293B] outline-none placeholder-slate-400 focus:bg-white focus:border-[#3674B5]"
                          value={checkoutPromoInput}
                          onChange={(e) => setCheckoutPromoInput(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer shrink-0"
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
                            className="w-full bg-[#FFFDF7] border border-[#EAE3D2] hover:border-[#3674B5]/40 rounded-xl px-3 py-2 text-xs font-bold text-[#1E293B] flex items-center justify-between shadow-2xs transition-all cursor-pointer"
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

                {/* Calculative Summary List */}
                <div className="border-t border-[#1E293B]/5 pt-4 space-y-3.5 text-xs font-semibold text-slate-700 text-left">
                  <div className="flex justify-between items-center">
                    <span>Cart Subtotal</span>
                    <span className="font-bold text-[#1E293B]">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-[#3674B5]">
                      <span className="flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5" />
                        <span>Promo Code Applied</span>
                      </span>
                      <span className="font-bold">– ₹{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-500" />
                      <span>Delivery Cost</span>
                    </span>
                    <span className="font-bold text-[#1E293B]">
                      {deliveryCharge === 0 ? (
                        <span className="text-[#3674B5] font-black uppercase text-[10px]">Free</span>
                      ) : (
                        `₹${deliveryCharge}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Estimated Tax (18% GST)</span>
                    <span className="font-bold text-[#1E293B]">₹{taxAmount.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-[#1E293B]/5 pt-4 flex justify-between items-center text-sm font-bold text-[#1E293B]">
                    <span>Final Amount</span>
                    <span className="text-[#3674B5] font-black text-base">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-[#1E293B]/5 pt-4 flex items-start gap-2.5 text-left">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                    Payments are processed securely by <span className="font-black text-[#3674B5]">Razorpay</span> using 256-bit SSL encryption. We never see or store your card or UPI details.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>



      {/* Payment Failure Dialog */}
      {paymentResult === "failure" && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-rose-500/20 p-8 shadow-2xl text-center space-y-5 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
              <X className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display font-black text-lg text-rose-800">Payment Failed</h3>
              <p className="text-xs font-bold text-rose-600 tracking-wider uppercase">Transaction could not be completed</p>
            </div>

            {paymentError && (
              <p className="text-xs font-semibold text-[#1E293B]/60 leading-relaxed max-w-xs mx-auto bg-rose-50 border border-rose-100 rounded-xl p-3">
                {paymentError}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={resetFailureState}
                className="w-full py-3 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="w-full py-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-wider transition-all"
              >
                Back to Shop
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <SearchModal />
    </div>
  );
}
