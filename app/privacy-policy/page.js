"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  ChevronRight, 
  CheckCircle, 
  Mail, 
  MapPin,
  Building2,
  Server,
  UserCheck,
  Cookie,
  CreditCard,
  ExternalLink,
  Clock,
  Globe,
  ShoppingBag,
  Users,
  Scale,
  FileCheck,
  AlertTriangle
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("s1");

  const navItems = [
    { id: "s1", label: "1. About RAVTRON" },
    { id: "s2", label: "2. Information We Collect" },
    { id: "s3", label: "3. How We Collect Information" },
    { id: "s4", label: "4. How We Use Information" },
    { id: "s5", label: "5. Cookies & Similar Tech" },
    { id: "s6", label: "6. Analytics" },
    { id: "s7", label: "7. Sharing & Disclosure" },
    { id: "s8", label: "8. Third-Party Websites" },
    { id: "s9", label: "9. Payment Information" },
    { id: "s10", label: "10. Data Security" },
    { id: "s11", label: "11. Data Retention" },
    { id: "s12", label: "12. Your Privacy Rights" },
    { id: "s13", label: "13. Withdrawal of Consent" },
    { id: "s14", label: "14. Marketing Preferences" },
    { id: "s15", label: "15. Children's Privacy" },
    { id: "s16", label: "16. International Transfers" },
    { id: "s17", label: "17. Data Breach Incidents" },
    { id: "s18", label: "18. Policy Changes" },
    { id: "s19", label: "19. Applicable Law" },
    { id: "s20", label: "20. Grievance & Contact" },
    { id: "s21", label: "21. Acceptance" }
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#334155] antialiased selection:bg-[#3674B5] selection:text-white">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 md:pt-14 pb-20 md:pb-28">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href="/" className="hover:text-[#3674B5] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-700 font-bold">Privacy Policy</span>
        </nav>

        {/* Header Title Banner */}
        <div className="space-y-4 max-w-4xl mb-10 text-left border-b border-slate-200/80 pb-8">
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#1E293B] tracking-tight leading-tight">
            RAVTRON® <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3674B5] to-[#578FCA]">Privacy Policy</span>
          </h1>

          <p className="text-xs font-extrabold text-[#3674B5] uppercase tracking-wider">
            Last Updated: 24 August 2026
          </p>

          <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
            RAVTRON® brand owned and operated by <strong>KSG Automation Pvt. Ltd.</strong> ("RAVTRON", "we", "our", or "us"). We respect your privacy and are committed to protecting the personal information entrusted to us by our customers, visitors, business partners and users of our website.
          </p>

          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            This Privacy Policy explains how we collect, use, process, store, disclose and protect personal information when you visit or use <a href="https://www.ravtron.com" className="text-[#3674B5] font-bold underline">www.ravtron.com</a>, purchase our products, register a product, request support, communicate with us, or otherwise interact with us.
          </p>

          <p className="text-xs text-slate-600 font-semibold italic bg-[#F8F9FA] border border-slate-200/80 p-4 rounded-2xl">
            By accessing or using our website or providing personal information to us, you acknowledge that you have read and understood this Privacy Policy. Where applicable, we will obtain consent or rely on another lawful basis for processing personal data as required under applicable law.
          </p>
        </div>

        {/* Content Layout with Side Anchors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Quick Nav Sidebar (Desktop Sticky) */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-28 bg-[#F8F9FA] border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-2xs max-h-[82vh] overflow-y-auto scrollbar-thin">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 pt-1">
                Policy Index (21 Sections)
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                      activeSection === item.id
                        ? "bg-[#3674B5] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Verbatim Text Column */}
          <div className="lg:col-span-9 space-y-10 text-left">

            {/* SECTION 1 */}
            <section id="s1" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  1. About RAVTRON
                </h2>
              </div>
              <div className="text-sm font-normal text-slate-600 leading-relaxed space-y-3 pt-2">
                <p>
                  RAVTRON® brand owned and operated by <strong>KSG Automation Pvt. Ltd.</strong>
                </p>
                <p>
                  For privacy-related questions, requests or complaints, you may contact us using the details provided in the Contact Us / Grievance section of this Privacy Policy.
                </p>
                <p>
                  This Privacy Policy applies to personal information collected through our website, online store, product registration, warranty or support services, customer communications and other interactions with RAVTRON.
                </p>
              </div>
            </section>

            {/* SECTION 2 */}
            <section id="s2" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  2. Information We Collect
                </h2>
              </div>
              <p className="text-sm font-medium text-slate-600">
                Depending on how you interact with us, we may collect the following categories of information:
              </p>

              {/* 2.1 */}
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-200/70 space-y-3">
                <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3674B5]" />
                  <span>2.1 Contact and Identity Information</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">This may include:</p>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-700 list-disc list-inside pl-2">
                  <li>Full name</li>
                  <li>Company or organisation name</li>
                  <li>Billing address</li>
                  <li>Shipping or delivery address</li>
                  <li>Email address</li>
                  <li>Telephone/mobile number</li>
                  <li>Country and city</li>
                  <li>Information provided when contacting our customer support team</li>
                  <li>Other information voluntarily provided by you</li>
                </ul>
              </div>

              {/* 2.2 */}
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-200/70 space-y-3">
                <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#3674B5]" />
                  <span>2.2 Order and Transaction Information</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">When you purchase products or request services from us, we may collect:</p>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-700 list-disc list-inside pl-2">
                  <li>Products ordered or purchased</li>
                  <li>Order number and invoice details</li>
                  <li>Billing and shipping information</li>
                  <li>Transaction amount</li>
                  <li>Payment status</li>
                  <li>Return, replacement or cancellation information</li>
                  <li>Warranty and service information</li>
                </ul>
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60">
                  Where payments are processed through third-party payment providers, payment card or banking information may be collected and processed directly by those providers. We generally do not require or retain complete payment-card credentials unless specifically necessary and legally permitted.
                </p>
              </div>

              {/* 2.3 */}
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-200/70 space-y-3">
                <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#3674B5]" />
                  <span>2.3 Product Registration and Warranty Information</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">If you register a RAVTRON product or request warranty/service support, we may collect:</p>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-700 list-disc list-inside pl-2">
                  <li>Product model and serial number</li>
                  <li>Date and place of purchase</li>
                  <li>Invoice or proof-of-purchase information</li>
                  <li>Customer contact information</li>
                  <li>Product installation or usage information where relevant</li>
                  <li>Service, repair, replacement or warranty history</li>
                </ul>
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60">
                  This information helps us verify ownership, provide warranty services, maintain product records and improve our products and services.
                </p>
              </div>

              {/* 2.4 */}
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-200/70 space-y-3">
                <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#3674B5]" />
                  <span>2.4 Communications and Support Information</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When you contact us by email, telephone, website forms, messaging platforms or other communication channels, we may retain information contained in those communications, including your contact details and the nature of your request.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We may use this information to respond to enquiries, provide technical or customer support, resolve complaints and maintain appropriate business records.
                </p>
              </div>

              {/* 2.5 */}
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-200/70 space-y-3">
                <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#3674B5]" />
                  <span>2.5 Technical and Usage Information</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">When you visit our website, certain information may be collected automatically, including:</p>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-700 list-disc list-inside pl-2">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device type</li>
                  <li>Operating system</li>
                  <li>Website pages visited</li>
                  <li>Date and time of visits</li>
                  <li>Referring website</li>
                  <li>Approximate geographic information</li>
                  <li>Website interaction and usage information</li>
                  <li>Error and diagnostic information</li>
                </ul>
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60">
                  This information may be used for website security, analytics, troubleshooting and improving our website and services.
                </p>
              </div>
            </section>

            {/* SECTION 3 */}
            <section id="s3" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  3. How We Collect Information
                </h2>
              </div>
              <p className="text-sm font-medium text-slate-600">We may collect personal information:</p>
              <ol className="space-y-2.5 text-sm text-slate-700 font-medium list-decimal list-inside pl-2">
                <li>Directly from you when you place an order, submit an enquiry, register a product or contact us.</li>
                <li>Automatically when you use our website through cookies and similar technologies.</li>
                <li>From service providers that assist us with website hosting, payment processing, shipping, analytics, customer support or other business functions.</li>
                <li>From authorised business partners, distributors or other third parties where appropriate and permitted by law.</li>
                <li>From publicly available sources where permitted by applicable law.</li>
              </ol>
            </section>

            {/* SECTION 4 */}
            <section id="s4" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  4. How We Use Your Personal Information
                </h2>
              </div>
              <p className="text-sm font-medium text-slate-600">
                We may use personal information for legitimate business and service-related purposes, including:
              </p>

              <div className="space-y-4">
                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-2">
                  <h3 className="font-bold text-sm text-[#1E293B]">4.1 Processing Orders</h3>
                  <p className="text-xs text-slate-500 font-medium">To:</p>
                  <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                    <li>Process and fulfil orders</li>
                    <li>Verify transactions</li>
                    <li>Arrange shipping and delivery</li>
                    <li>Provide order confirmations</li>
                    <li>Provide shipment and tracking information</li>
                    <li>Process returns, replacements and cancellations</li>
                    <li>Communicate with you regarding your order</li>
                  </ul>
                </div>

                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-2">
                  <h3 className="font-bold text-sm text-[#1E293B]">4.2 Product Support and Warranty</h3>
                  <p className="text-xs text-slate-500 font-medium">To:</p>
                  <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                    <li>Register products</li>
                    <li>Verify warranty eligibility</li>
                    <li>Provide technical assistance</li>
                    <li>Process warranty claims</li>
                    <li>Arrange repair or replacement</li>
                    <li>Maintain service records</li>
                  </ul>
                </div>

                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-2">
                  <h3 className="font-bold text-sm text-[#1E293B]">4.3 Customer Service</h3>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    To respond to enquiries, complaints, requests and support requirements and to improve our customer service.
                  </p>
                </div>

                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-2">
                  <h3 className="font-bold text-sm text-[#1E293B]">4.4 Business Operations</h3>
                  <p className="text-xs text-slate-500 font-medium">To:</p>
                  <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                    <li>Maintain business records</li>
                    <li>Manage customer and partner relationships</li>
                    <li>Improve products and services</li>
                    <li>Conduct internal analysis and reporting</li>
                    <li>Understand customer requirements</li>
                    <li>Maintain website functionality</li>
                    <li>Detect and prevent fraudulent or unlawful activities</li>
                  </ul>
                </div>

                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-2">
                  <h3 className="font-bold text-sm text-[#1E293B]">4.5 Website Security</h3>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    To protect our website, systems, customers and business against unauthorised access, fraud, malicious activity and other security threats.
                  </p>
                </div>

                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-3">
                  <h3 className="font-bold text-sm text-[#1E293B]">4.6 Marketing and Communications</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Where permitted by law and, where required, with your consent, we may use your contact information to send:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                    <li>Product information</li>
                    <li>New product announcements</li>
                    <li>Promotional offers</li>
                    <li>Service updates</li>
                    <li>Company communications</li>
                    <li>Newsletters or other marketing communications</li>
                  </ul>
                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60">
                    You may opt out of promotional communications at any time by using the unsubscribe facility provided in the communication or by contacting us.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">
                    Please note that opting out of marketing communications will not prevent us from sending essential communications relating to orders, warranties, service requests, security, transactions or other necessary business matters.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 5 */}
            <section id="s5" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Cookie className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  5. Cookies and Similar Technologies
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>Our website may use cookies and similar technologies.</p>
                <p>
                  Cookies are small data files placed on your device that help websites remember information and understand how visitors use the website.
                </p>
                <p className="font-bold text-[#1E293B]">We may use cookies for purposes such as:</p>
                <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                  <li>Website functionality</li>
                  <li>Security</li>
                  <li>Remembering preferences</li>
                  <li>Understanding website usage</li>
                  <li>Analytics</li>
                  <li>Improving website performance</li>
                  <li>Measuring marketing effectiveness</li>
                  <li>Providing relevant advertising, where applicable</li>
                </ul>
                <p>
                  Some cookies may be placed by third-party service providers, such as analytics or advertising providers.
                </p>
                <p>
                  You may control or disable cookies through your browser settings. However, disabling certain cookies may affect the functionality or availability of some features of our website.
                </p>
              </div>
            </section>

            {/* SECTION 6 */}
            <section id="s6" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  6. Analytics
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  We may use third-party analytics services to understand how visitors use our website and to improve website performance and customer experience.
                </p>
                <p>
                  These services may collect information such as IP address, browser information, device information, pages visited and interaction data.
                </p>
                <p>
                  Where applicable, third-party analytics providers process information in accordance with their own privacy policies and applicable laws.
                </p>
              </div>
            </section>

            {/* SECTION 7 */}
            <section id="s7" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  7. Sharing and Disclosure of Personal Information
                </h2>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl text-xs font-extrabold text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>We do not sell your personal information.</span>
              </div>

              <p className="text-sm font-medium text-slate-600">
                We may share personal information where reasonably necessary for legitimate business purposes, including with:
              </p>

              <div className="space-y-4">
                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-2">
                  <h3 className="font-bold text-sm text-[#1E293B]">7.1 Service Providers</h3>
                  <p className="text-xs text-slate-500 font-medium">We may use third-party service providers for:</p>
                  <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                    <li>Website hosting</li>
                    <li>E-commerce/platform services</li>
                    <li>Payment processing</li>
                    <li>Shipping and logistics</li>
                    <li>Customer support</li>
                    <li>IT and technology services</li>
                    <li>Cloud storage</li>
                    <li>Data analytics</li>
                    <li>Website security</li>
                    <li>Marketing and communication services</li>
                  </ul>
                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60">
                    Such service providers may process personal information on our behalf and are expected to use it only for the services they provide to us, subject to applicable contractual and legal requirements.
                  </p>
                </div>

                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-2">
                  <h3 className="font-bold text-sm text-[#1E293B]">7.2 Business Partners</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We may share limited information with authorised distributors, dealers, logistics partners, service partners or other business partners where necessary to provide products or services to you.
                  </p>
                </div>

                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-2">
                  <h3 className="font-bold text-sm text-[#1E293B]">7.3 Legal and Regulatory Requirements</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    We may disclose personal information where required or permitted by applicable law, including in response to:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                    <li>Government or regulatory requests</li>
                    <li>Court orders</li>
                    <li>Legal proceedings</li>
                    <li>Law-enforcement requirements</li>
                    <li>Fraud investigations</li>
                    <li>Protection of our legal rights</li>
                    <li>Protection of the safety, security or property of RAVTRON, our customers or others</li>
                  </ul>
                </div>

                <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/70 space-y-2">
                  <h3 className="font-bold text-sm text-[#1E293B]">7.4 Business Transfers</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If RAVTRON or KSG Automation Pvt. Ltd. undergoes a merger, acquisition, restructuring, sale of assets or similar business transaction, personal information may be transferred as part of that transaction, subject to applicable law and appropriate safeguards.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 8 */}
            <section id="s8" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  8. Third-Party Websites and Services
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  Our website may contain links to third-party websites, applications, marketplaces, payment providers, social-media platforms or other services.
                </p>
                <p>
                  These third-party services operate independently and may have their own privacy policies and terms of use.
                </p>
                <p>
                  RAVTRON is not responsible for the privacy practices, security or content of third-party websites or services.
                </p>
                <p>
                  We recommend reviewing the privacy policy of any third-party service before providing your personal information to it.
                </p>
              </div>
            </section>

            {/* SECTION 9 */}
            <section id="s9" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  9. Payment Information
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>Payments may be processed through third-party payment service providers.</p>
                <p>
                  Depending on the payment method used, the payment provider may collect and process information necessary to complete the transaction.
                </p>
                <p>
                  We encourage you to review the privacy policy and security practices of the relevant payment provider.
                </p>
                <p>
                  RAVTRON will use payment-related information only as reasonably necessary to process transactions, prevent fraud, maintain records and comply with applicable legal requirements.
                </p>
              </div>
            </section>

            {/* SECTION 10 */}
            <section id="s10" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  10. Data Security
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  We take reasonable and appropriate measures designed to protect personal information against unauthorised access, alteration, disclosure, misuse, loss or destruction.
                </p>
                <p className="font-bold text-[#1E293B]">Depending on the nature of the information and the risks involved, safeguards may include:</p>
                <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                  <li>Access controls</li>
                  <li>Authentication mechanisms</li>
                  <li>Secure transmission technologies where appropriate</li>
                  <li>System and network security measures</li>
                  <li>Administrative controls</li>
                  <li>Restricted access to personal information</li>
                  <li>Appropriate contractual safeguards with service providers</li>
                </ul>
                <p>
                  However, no method of transmission over the Internet or method of electronic storage can be guaranteed to be completely secure.
                </p>
                <p className="italic text-slate-500 font-semibold">
                  Accordingly, while we take reasonable measures to protect personal information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* SECTION 11 */}
            <section id="s11" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  11. Data Retention
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, including:
                </p>
                <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                  <li>Providing products and services</li>
                  <li>Warranty and after-sales support</li>
                  <li>Maintaining business and transaction records</li>
                  <li>Meeting accounting, tax and legal obligations</li>
                  <li>Resolving disputes</li>
                  <li>Preventing fraud or misuse</li>
                  <li>Establishing, exercising or defending legal claims</li>
                </ul>
                <p>
                  When personal information is no longer required, we may securely delete, anonymise or otherwise dispose of it in accordance with applicable law and our internal practices.
                </p>
              </div>
            </section>

            {/* SECTION 12 */}
            <section id="s12" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  12. Your Privacy Rights
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  Subject to applicable law and any applicable conditions or exceptions, you may have rights relating to your personal information, including the ability to:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                  <li>Request access to personal information held about you</li>
                  <li>Request correction of inaccurate or incomplete information</li>
                  <li>Request deletion of personal information where permitted</li>
                  <li>Withdraw consent where processing is based on consent</li>
                  <li>Request information regarding the processing of your personal data</li>
                  <li>Opt out of promotional communications</li>
                  <li>Raise a complaint regarding our processing of your personal information</li>
                </ul>
                <p>
                  Certain information may need to be retained where required by law or where necessary to establish, exercise or defend legal claims.
                </p>
                <p>
                  We may need to verify your identity before processing certain requests.
                </p>
              </div>
            </section>

            {/* SECTION 13 */}
            <section id="s13" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  13. Withdrawal of Consent
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  Where we process your personal information based on your consent, you may withdraw your consent by contacting us using the details provided below.
                </p>
                <p>
                  Withdrawal of consent will not affect processing that occurred before withdrawal.
                </p>
                <p>
                  In certain circumstances, withdrawing consent may affect our ability to provide particular products, services, warranty support or other functionality where the relevant information is necessary for that purpose.
                </p>
              </div>
            </section>

            {/* SECTION 14 */}
            <section id="s14" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  14. Marketing Preferences
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>You may choose not to receive promotional communications from us.</p>
                <p className="font-bold text-[#1E293B]">You can unsubscribe by:</p>
                <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                  <li>Using the unsubscribe option included in promotional emails; or</li>
                  <li>Contacting us using the details provided below.</li>
                </ul>
                <p>
                  Even if you opt out of marketing communications, we may continue to send necessary communications relating to your orders, transactions, warranties, service requests, security matters or other essential business interactions.
                </p>
              </div>
            </section>

            {/* SECTION 15 */}
            <section id="s15" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  15. Children's Privacy
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  Our website and services are intended primarily for adults and persons legally capable of entering into contracts under applicable law.
                </p>
                <p>
                  We do not knowingly solicit or intentionally collect personal information from children where such collection is prohibited by applicable law.
                </p>
                <p>
                  If you believe that a child has provided personal information to us in circumstances where such collection is not permitted, please contact us so that we can take appropriate action.
                </p>
              </div>
            </section>

            {/* SECTION 16 */}
            <section id="s16" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  16. International Data Transfers
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  Some of our technology, service providers or business partners may operate outside India.
                </p>
                <p>
                  Where personal information is transferred, stored or processed outside India, we will take reasonable steps to ensure that such processing is carried out in accordance with applicable law and appropriate contractual, technical and organisational safeguards.
                </p>
                <p>
                  International transfers may be necessary for certain technology, hosting, payment, analytics, communication or other business services.
                </p>
              </div>
            </section>

            {/* SECTION 17 */}
            <section id="s17" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  17. Data Breach and Security Incidents
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  If we become aware of a personal data breach affecting personal information, we will take reasonable steps to investigate, contain and mitigate the incident and provide notifications where required under applicable law.
                </p>
                <p>
                  We may also cooperate with relevant authorities, service providers and other parties as necessary to address and resolve a security incident.
                </p>
              </div>
            </section>

            {/* SECTION 18 */}
            <section id="s18" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  18. Changes to This Privacy Policy
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>We may update this Privacy Policy from time to time to reflect:</p>
                <ul className="space-y-1 text-xs text-slate-700 font-semibold list-disc list-inside pl-2">
                  <li>Changes in our business or services</li>
                  <li>Changes in technology</li>
                  <li>Changes in our data-processing practices</li>
                  <li>Changes in applicable laws or regulations</li>
                  <li>Improvements to our privacy practices</li>
                </ul>
                <p>
                  When we update this Privacy Policy, we will publish the revised version on our website and update the "Last Updated" date.
                </p>
                <p>We encourage you to periodically review this Privacy Policy.</p>
              </div>
            </section>

            {/* SECTION 19 */}
            <section id="s19" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  19. Applicable Law
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  This Privacy Policy shall be interpreted in accordance with the applicable laws of India.
                </p>
                <p className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200/70 font-semibold text-slate-800">
                  Where applicable, the processing of personal data will be carried out in accordance with the <strong>Digital Personal Data Protection Act, 2023</strong>, the <strong>Digital Personal Data Protection Rules, 2025</strong>, and other applicable privacy, data protection and information-technology laws and regulations, as amended or replaced from time to time.
                </p>
                <p>Nothing in this Privacy Policy limits any rights available to you under applicable law.</p>
              </div>
            </section>

            {/* SECTION 20 */}
            <section id="s20" className="bg-gradient-to-br from-[#3674B5]/5 via-white to-slate-50 border border-[#3674B5]/20 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6 shadow-sm scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5] text-white flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                    20. Grievance and Privacy Contact
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">KSG Automation Pvt. Ltd. | Brand: RAVTRON®</p>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-600">
                If you have questions regarding this Privacy Policy, wish to exercise an applicable privacy right, or have a complaint regarding the processing of your personal information, please contact us.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Mail className="w-4 h-4 text-[#3674B5]" />
                    <span>Privacy / Grievance Contact</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    KSG Automation Pvt. Ltd.<br />
                    Brand: RAVTRON®<br />
                    Website: <a href="https://www.ravtron.com" className="text-[#3674B5] underline">www.ravtron.com</a>
                  </p>
                  <p className="text-xs font-bold text-slate-800 pt-1">Email:</p>
                  <a 
                    href="mailto:officerequirementsgurgaon@gmail.com"
                    className="font-bold text-xs sm:text-sm text-[#3674B5] hover:underline whitespace-nowrap block"
                  >
                    officerequirementsgurgaon@gmail.com
                  </a>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-[#3674B5]" />
                    <span>Registered / Corporate Office</span>
                  </div>
                  <p className="text-xs font-bold text-[#1E293B] leading-relaxed">
                    KSG Automation Pvt. Ltd.,<br />
                    No.6, 1st Floor, Vakil Market, Vijaya Complex,<br />
                    Chakkarpur, Gurgaon – 122002
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-semibold italic pt-2">
                We will review and respond to privacy-related requests in accordance with applicable law.
              </p>
            </section>

            {/* SECTION 21 */}
            <section id="s21" className="bg-white border border-slate-200/80 rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 shadow-2xs scroll-mt-28">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-xl md:text-2xl text-[#1E293B]">
                  21. Acceptance
                </h2>
              </div>
              <div className="text-sm font-medium text-slate-600 leading-relaxed space-y-3">
                <p>
                  By using the RAVTRON website or providing personal information to us, you acknowledge that you have read this Privacy Policy.
                </p>
                <p>
                  Where applicable law requires consent for a particular processing activity, we will obtain such consent through an appropriate mechanism.
                </p>
                <div className="pt-4 border-t border-slate-100 font-bold text-[#1E293B]">
                  <p className="text-base font-black">RAVTRON®</p>
                  <p className="text-xs text-slate-500 font-semibold">A brand of KSG Automation Pvt. Ltd.</p>
                </div>
              </div>
            </section>

          </div>
        </div>

      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}
