"use client";
 
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../context/CartContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import CartDrawer from "../../components/CartDrawer";
import { 
  HelpCircle, 
  MapPin, 
  Mail, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  CheckCircle, 
  Clock, 
  Truck, 
  Check, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  Barcode,
  UploadCloud,
  FileText,
  X,
  ExternalLink
} from "lucide-react";
 
export default function SupportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useCart();
 
  // Tab Management: faq, track, contact, warranty
  const [activeSubTab, setActiveSubTab] = useState("faq");
 
  // Listen to hash or search parameters to select tab automatically
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveSubTab(tabParam);
    } else {
      // Check window location hash
      const hash = window.location.hash;
      if (hash === "#track") setActiveSubTab("track");
      else if (hash === "#faq" || hash === "#returns") setActiveSubTab("faq");
      else if (hash === "#contact") setActiveSubTab("contact");
      else if (hash === "#warranty") setActiveSubTab("warranty");
    }
  }, [searchParams]);
 
  // 1. Order Tracking States
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackEmail, setTrackEmail] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(null);
 
  // 2. FAQ Accordion States
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
 
  // 3. Contact Form States
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "Order Issue",
    message: ""
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
 
  // 4. Warranty Form States
  const [warrantyForm, setWarrantyForm] = useState({
    name: "",
    email: "",
    productName: "",
    serialNumber: "",
    purchaseDate: "",
    invoiceFile: "",
    issueDescription: ""
  });
  const [proofFile, setProofFile] = useState(null);
  const [isSubmittingWarranty, setIsSubmittingWarranty] = useState(false);
  const [warrantySubmitted, setWarrantySubmitted] = useState(false);

  // FAQ Data List
  const faqData = [
    {
      category: "Order & Delivery",
      question: "How do I track my order status?",
      answer: "You can track your order directly on this page under the 'Order Tracking' tab. Simply enter your Order ID (received in your confirmation email, e.g., RVT-DELIVER-02) and billing email address."
    },
    {
      category: "Order & Delivery",
      question: "What are your standard shipping times?",
      answer: "Standard delivery takes between 2 to 5 business days for major metropolitan areas, and 5 to 7 days for remote locations. Express shipping takes 1 to 2 business days."
    },
    {
      category: "Cancellations & Policy",
      question: "Do you accept product returns or exchanges?",
      answer: "We maintain a strict No Returns & No Exchanges policy once an order has been shipped and delivered, as all accessories undergo comprehensive factory inspection prior to dispatch. However, all purchases are protected by our 1-Year Manufacturer Warranty."
    },
    {
      category: "Cancellations & Policy",
      question: "Can I cancel my order?",
      answer: "Yes, you can cancel your order directly from your Account Profile within 24 hours of placing it for an immediate 100% full refund back to your original payment method."
    },
    {
      category: "Warranty & Support",
      question: "How do I claim product warranty?",
      answer: "All RAVTRON® products (cables, adapters, docking stations) are backed by a 1-year replacement warranty. You can register your product or submit a claim directly under the 'Warranty Claims' tab on this page."
    },
    {
      category: "Warranty & Support",
      question: "Are RAVTRON display adapters and docking stations plug-and-play compatible?",
      answer: "Yes, all RAVTRON® display cables, video converters, and multiport docking stations are plug-and-play compatible with Windows, macOS, ChromeOS, and Android without requiring manual driver installations."
    },
    {
      category: "Payments",
      question: "What payment methods do you accept?",
      answer: "We accept all major Credit/Debit Cards (Visa, Mastercard, RuPay), UPI payments, NetBanking, and popular e-wallets via our secure payment gateway."
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqData.filter(
    (faq) => 
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Handle Track Order API Submission
  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackOrderId.trim() || !trackEmail.trim()) {
      showToast("Please fill in both fields.", "error");
      return;
    }

    setIsTracking(true);
    setTrackedOrder(null);

    try {
      const response = await fetch(`/api/orders/${trackOrderId.trim()}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order ID not found. Please verify the ID.");
        }
        throw new Error("Failed to retrieve order tracking information.");
      }

      const order = await response.json();
      
      // Verify that email matches (case insensitive)
      if (order.customerEmail?.toLowerCase() !== trackEmail.trim().toLowerCase()) {
        throw new Error("The email address provided does not match our records for this order.");
      }

      setTrackedOrder(order);
      showToast("Order tracking data updated!");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error tracking order.", "error");
    } finally {
      setIsTracking(false);
    }
  };

  // Handle Contact Support Submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message,
          category: "Customer Support Inquiry"
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to register support ticket");
      }

      setIsSubmittingContact(false);
      setContactSubmitted(true);
      showToast("Support ticket created! Check your email for reference.");
      setContactForm({ name: "", email: "", subject: "Order Issue", message: "" });
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to submit support ticket.", "error");
      setIsSubmittingContact(false);
    }
  };

  // Handle Warranty Claim Submission
  const handleWarrantySubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingWarranty(true);

    try {
      let uploadedProofUrl = "";

      if (proofFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", proofFile);

        const uploadRes = await fetch("/api/upload/support-proof", {
          method: "POST",
          body: uploadFormData
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error || "Failed to upload invoice proof document");
        }

        const uploadData = await uploadRes.json();
        uploadedProofUrl = uploadData.url;
      }

      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: warrantyForm.name,
          email: warrantyForm.email,
          subject: `1-Year Warranty Claim: ${warrantyForm.productName}`,
          message: `Serial Number: ${warrantyForm.serialNumber || "N/A"}\nPurchase Date: ${warrantyForm.purchaseDate || "N/A"}\nInvoice No: ${warrantyForm.invoiceFile || "N/A"}\nIssue Description: ${warrantyForm.issueDescription}`,
          category: "1-Year Product Warranty Claim",
          proofUrl: uploadedProofUrl
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to register warranty claim");
      }

      setIsSubmittingWarranty(false);
      setWarrantySubmitted(true);
      setProofFile(null);
      showToast("Warranty replacement ticket registered.");
      setWarrantyForm({
        name: "",
        email: "",
        productName: "",
        serialNumber: "",
        purchaseDate: "",
        invoiceFile: "",
        issueDescription: ""
      });
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to submit warranty claim.", "error");
      setIsSubmittingWarranty(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-bg-brand text-text-brand antialiased selection:bg-[#3674B5] selection:text-white">
      <Navbar />
 
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 md:pt-12 pb-16 md:pb-24 space-y-8 md:space-y-16 relative z-10">
        
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto border-b border-[#1E293B]/10 pb-6 md:pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3674B5] animate-pulse" />
            <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
              Customer Support Center
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#1E293B] tracking-tight leading-tight">
            How Can We <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3674B5] to-[#578FCA]">Help You?</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#1E293B]/50 leading-relaxed max-w-md mx-auto">
            Track deliveries, view answers to common questions, file warranty claims, or contact our core engineering team.
          </p>
        </div>
 
        {/* Horizontal Navigation Sub-Tabs */}
        <div className="flex justify-center border-b border-[#1E293B]/5 max-w-md sm:max-w-xl mx-auto">
          <div className="flex gap-2 sm:gap-6 pb-px overflow-x-auto scrollbar-none w-full justify-between sm:justify-center">
            {[
              { id: "faq", label: "FAQs", icon: <HelpCircle className="w-4 h-4" /> },
              { id: "track", label: "Track Order", icon: <MapPin className="w-4 h-4" /> },
              { id: "contact", label: "Contact Us", icon: <Mail className="w-4 h-4" /> },
              { id: "warranty", label: "Warranty Claim", icon: <ShieldAlert className="w-4 h-4" /> }
            ].map((tab) => {
              const active = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id);
                    // Clear search states on tab changes
                    setTrackedOrder(null);
                    setContactSubmitted(false);
                    setWarrantySubmitted(false);
                  }}
                  className={`flex items-center gap-1.5 pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer ${
                    active 
                      ? "border-[#3674B5] text-[#3674B5] font-black" 
                      : "border-transparent text-[#1E293B]/50 hover:text-[#1E293B]"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
 
        {/* TAB CONTENTS CONTAINER */}
        <div className="max-w-3xl mx-auto">
 
          {/* TAB 1: FAQ ACCORDIONS */}
          {activeSubTab === "faq" && (
            <div className="space-y-6 md:space-y-8 animate-fade-in text-left">
              {/* Search Bar inside FAQs */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search FAQ questions, topics, or terms..."
                  className="w-full bg-white border border-[#1E293B]/10 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#3674B5] shadow-xs"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                />
              </div>
 
              {/* FAQ Accordion List */}
              <div className="space-y-3.5">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#1E293B]/10">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching FAQs found</p>
                  </div>
                ) : (
                  filteredFaqs.map((faq, idx) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <div 
                        key={idx} 
                        className="bg-white border border-[#1E293B]/10 rounded-2xl shadow-2xs hover:border-[#1E293B]/15 transition-all overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedFaq(isOpen ? null : idx)}
                          className="w-full p-4 md:p-5 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="space-y-1 min-w-0 pr-4">
                            <span className="text-[8px] font-black text-[#3674B5] uppercase bg-[#3674B5]/5 border border-[#3674B5]/15 px-2 py-0.5 rounded">
                              {faq.category}
                            </span>
                            <h3 className="font-display font-bold text-sm md:text-base text-slate-900 leading-tight">
                              {faq.question}
                            </h3>
                          </div>
                          <span className="text-slate-400 shrink-0">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 md:px-5 pb-5 border-t border-slate-50 bg-slate-50/20 pt-3 text-xs md:text-sm font-medium text-slate-600 leading-relaxed animate-fade-in">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
 
          {/* TAB 2: ORDER TRACKING */}
          {activeSubTab === "track" && (
            <div className="space-y-8 animate-fade-in text-left">
              {/* Form Input Card */}
              <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Track Order Status</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Enter details to lookup real-time package delivery tracking status.</p>
                </div>
 
                <form onSubmit={handleTrackOrder} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID / Reference</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. RVT-DELIVER-02"
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                        value={trackOrderId}
                        onChange={(e) => setTrackOrderId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billing Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. customer@example.com"
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                        value={trackEmail}
                        onChange={(e) => setTrackEmail(e.target.value)}
                      />
                    </div>
                  </div>
 
                  <button
                    type="submit"
                    disabled={isTracking}
                    className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isTracking ? "Retrieving Tracking Details..." : "Track Order Status"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
 
              {/* Tracking Results Output */}
              {trackedOrder && (
                <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
                  
                  {/* Summary Details */}
                  <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 pb-4 gap-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Reference</p>
                      <h4 className="text-base font-black text-slate-900">{trackedOrder.id}</h4>
                    </div>
                    <div className="space-y-0.5 text-left sm:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Date</p>
                      <p className="text-xs font-bold text-slate-900">{trackedOrder.date}</p>
                    </div>
                    <div className="space-y-0.5 text-left sm:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Total</p>
                      <p className="text-xs font-black text-[#3674B5]">₹{trackedOrder.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Courier & Tracking Details Card */}
                  {(trackedOrder.courier || trackedOrder.courierName || trackedOrder.trackingId) && (
                    <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#3674B5]" />
                          <span className="font-bold text-slate-900">Shipment Tracking Details</span>
                        </div>
                        {trackedOrder.trackingUrl && (
                          <a
                            href={trackedOrder.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-[#3674B5] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Track on Courier Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Courier Partner</span>
                          <span className="font-bold text-slate-900">{trackedOrder.courier || trackedOrder.courierName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tracking / AWB Number</span>
                          <span className="font-mono font-bold text-[#3674B5]">{trackedOrder.trackingId || "Assigned"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Delivery</span>
                          <span className="font-semibold text-slate-700">{trackedOrder.estimatedDelivery || "3 - 5 Business Days"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real-time Tracking Steps Status (timeline visualization) */}
                  <div className="space-y-5">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Milestones</h5>
                    
                    {trackedOrder.status === "Cancelled" || trackedOrder.status === "CANCELLED" ? (
                      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-wide">Order Cancelled</p>
                          <p className="text-[11px] font-medium text-rose-600 mt-0.5">This transaction has been cancelled. If this is a mistake, please reach out to customer support.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 ml-3">
                        {/* Default active steps mapping */}
                        {(() => {
                          const steps = trackedOrder.trackingSteps || [
                            { title: "Order Placed", date: trackedOrder.date, done: true },
                            { title: "Packed & Verified", date: "Pending", done: false },
                            { title: "Shipped", date: "Pending", done: false },
                            { title: "In Transit", date: "Pending", done: false },
                            { title: "Delivered", date: "Pending Delivery", done: false }
                          ];
                          
                          return steps.map((step, idx) => {
                            const isDone = step.done;
                            return (
                              <div key={idx} className="relative">
                                {/* Timeline Bullet Indicator */}
                                <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isDone
                                    ? "bg-[#3674B5] border-white text-white shadow-sm"
                                    : "bg-white border-slate-200 text-slate-400"
                                }`}>
                                  {isDone ? (
                                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-350" />
                                  )}
                                </span>
 
                                <div className="space-y-0.5">
                                  <h6 className={`text-xs font-black uppercase tracking-wide ${isDone ? "text-slate-900" : "text-slate-400"}`}>
                                    {step.title}
                                  </h6>
                                  <p className="text-[10px] text-slate-400 font-semibold">{step.date}</p>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
 
                  {/* Items Ordered List */}
                  <div className="border-t border-slate-100 pt-5 space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Packages Inventory</h5>
                    <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-slate-100 space-y-2.5">
                      {trackedOrder.items.map((item, idy) => (
                        <div key={idy} className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{item.name} <span className="text-slate-400 font-medium">x{item.qty}</span></span>
                          <span className="font-bold text-slate-900">₹{((item.price || 0) * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
 
                </div>
              )}
            </div>
          )}
 
          {/* TAB 3: CONTACT FORM */}
          {activeSubTab === "contact" && (
            <div className="animate-fade-in text-left">
              {contactSubmitted ? (
                <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 font-display">Message Received</h3>
                    <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                      Thank you for contacting RAVTRON®. A Customer Care Specialist has been assigned and will reply to your registered email address within 12–24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Contact Support Team</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Submit support tickets, business inquiries, or general product feedback.</p>
                  </div>
 
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. john@example.com"
                          className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        />
                      </div>
                    </div>
 
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Category</label>
                      <select
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      >
                        <option value="Order Issue">Order Shipping / Status Issues</option>
                        <option value="Technical Support">Technical Product Help</option>
                        <option value="Billing & Payments">Billing, Refunds & Discounts</option>
                        <option value="Business Inquiry">Bulk Inquiries & Partnerships</option>
                        <option value="Other">Other Topic</option>
                      </select>
                    </div>
 
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Write message detail</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Please describe your problem or question in detail..."
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>
 
                    <button
                      type="submit"
                      disabled={isSubmittingContact}
                      className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingContact ? "Sending Message..." : "Send Message Ticket"}
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
 
          {/* TAB 4: WARRANTY CLAIMS */}
          {activeSubTab === "warranty" && (
            <div className="animate-fade-in text-left space-y-6">
              
              {/* Brand Warranty Promise Info Card */}
              <div className="bg-[#3674B5]/5 border border-[#3674B5]/20 rounded-3xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#3674B5]/15 border border-[#3674B5]/25 flex items-center justify-center text-[#3674B5] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">1-Year Replacement Warranty</h4>
                  <p className="text-[11px] md:text-xs text-slate-500 font-semibold leading-relaxed">
                    All genuine RAVTRON® products come with our official quality replacement guarantee covering functional performance, internal component integrity, and signal precision. It does not cover accidental physical breaks or liquid damages.
                  </p>
                </div>
              </div>
 
              {warrantySubmitted ? (
                <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 font-display">Warranty Claim Registered</h3>
                    <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                      Your warranty replacement claim has been registered. Our product diagnostics team will evaluate the details and email return instructions for the damaged unit.
                    </p>
                  </div>
                  <button
                    onClick={() => setWarrantySubmitted(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    File Another Claim
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#1E293B]/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Warranty Claim Form</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Please provide serial details and product invoice receipts to request replacements.</p>
                  </div>
 
                  <form onSubmit={handleWarrantySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                          value={warrantyForm.name}
                          onChange={(e) => setWarrantyForm({ ...warrantyForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. john@example.com"
                          className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                          value={warrantyForm.email}
                          onChange={(e) => setWarrantyForm({ ...warrantyForm, email: e.target.value })}
                        />
                      </div>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name / Model</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 100W PD Type-C Cable"
                          className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                          value={warrantyForm.productName}
                          onChange={(e) => setWarrantyForm({ ...warrantyForm, productName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          <span>Serial Number (S/N)</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Check bottom of box/product"
                          className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                          value={warrantyForm.serialNumber}
                          onChange={(e) => setWarrantyForm({ ...warrantyForm, serialNumber: e.target.value })}
                        />
                      </div>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Date</label>
                        <input
                          type="date"
                          required
                          className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                          value={warrantyForm.purchaseDate}
                          onChange={(e) => setWarrantyForm({ ...warrantyForm, purchaseDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reseller Invoice / Order No.</label>
                        <input
                          type="text"
                          placeholder="e.g. INV-9876 (Optional)"
                          className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                          value={warrantyForm.invoiceFile}
                          onChange={(e) => setWarrantyForm({ ...warrantyForm, invoiceFile: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Direct Purchase Receipt / Invoice Proof Upload Field */}
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Upload Purchase Invoice / Proof Receipt</span>
                        <span className="text-[9px] text-[#3674B5] font-extrabold uppercase">JPG, PNG, WebP, PDF (Max 5MB)</span>
                      </label>
                      {proofFile ? (
                        <div className="flex items-center justify-between p-3.5 bg-[#3674B5]/8 border border-[#3674B5]/30 rounded-xl animate-fade-in">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#3674B5]/15 border border-[#3674B5]/30 flex items-center justify-center text-[#3674B5] shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{proofFile.name}</p>
                              <p className="text-[10px] font-semibold text-slate-500">{(proofFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProofFile(null)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all shrink-0 cursor-pointer"
                            title="Remove attached file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2.5 p-4 bg-[#F8F9FA] hover:bg-slate-100/90 border border-dashed border-slate-300 rounded-xl cursor-pointer transition-all text-slate-500 hover:text-slate-800 group">
                          <UploadCloud className="w-4 h-4 text-[#3674B5] group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold">Click to attach photo or PDF invoice receipt</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                showToast("File size exceeds 5MB limit. Please choose a smaller file.", "error");
                                return;
                              }
                              const ext = file.name.split(".").pop()?.toLowerCase();
                              if (!["jpg", "jpeg", "png", "webp", "pdf"].includes(ext)) {
                                showToast("Invalid file type. Only JPG, PNG, WebP images and PDF documents are allowed.", "error");
                                return;
                              }
                              setProofFile(file);
                              showToast("Proof receipt attached!");
                            }}
                          />
                        </label>
                      )}
                    </div>
 
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Describe the product issue</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Please detail how the device failed (e.g. stopped charging, visual damage, loose connection)..."
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                        value={warrantyForm.issueDescription}
                        onChange={(e) => setWarrantyForm({ ...warrantyForm, issueDescription: e.target.value })}
                      />
                    </div>
 
                    <button
                      type="submit"
                      disabled={isSubmittingWarranty}
                      className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingWarranty ? "Registering Claim..." : "File Replacement Claim"}
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </button>
                  </form>
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
