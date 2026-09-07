"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, Heart, Zap, ArrowRight, Globe, Cpu, Radio, Award, Building2, CheckCircle2, PackageCheck } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SearchModal from "../../components/SearchModal";
import { useCart } from "../context/CartContext";

export default function AboutPage() {
  const router = useRouter();
  const { products: cartProducts } = useCart();

  const allProducts = Array.isArray(cartProducts) && cartProducts.length > 0 ? cartProducts : [];
  const displayGroup1 = allProducts.slice(0, 4);
  const displayGroup2 = allProducts.length >= 8 ? allProducts.slice(4, 8) : allProducts.slice(0, 4);

  const pillars = [
    {
      icon: <Heart className="w-5 h-5 text-[#3674B5]" />,
      title: "Customer Satisfaction",
      desc: "Prioritizing user experience and building reliable, long-term partnerships."
    },
    {
      icon: <Zap className="w-5 h-5 text-[#DEC89E]" />,
      title: "Innovation & Excellence",
      desc: "Pushing technological boundaries continuously to deliver cutting-edge solutions."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#3674B5]" />,
      title: "Empathy & Dedication",
      desc: "Understanding and addressing evolving customer needs with precision and care."
    }
  ];

  const highlights = [
    {
      icon: <Globe className="w-6 h-6 text-[#3674B5]" />,
      title: "Global Headquarters",
      subtitle: "Gurugram, India",
      detail: "Strategic operations & branches across China, Singapore, and USA."
    },
    {
      icon: <Cpu className="w-6 h-6 text-[#3674B5]" />,
      title: "R&D Engineering",
      subtitle: "Signal & Circuit Safety",
      detail: "Custom signal shielding and protective circuitry engineered for maximum transmission purity."
    },
    {
      icon: <Radio className="w-6 h-6 text-[#3674B5]" />,
      title: "Infrastructure & Security",
      subtitle: "Enterprise Networking",
      detail: "High-density patch cords, CCTV SMPS power units, and PoE switches."
    },
    {
      icon: <Award className="w-6 h-6 text-[#3674B5]" />,
      title: "ISO Certification",
      subtitle: "Strict QA Control",
      detail: "100% genuine RAVTRON® products with official quality guarantee."
    }
  ];

  return (
    <div className="min-h-screen bg-bg-brand text-text-brand antialiased selection:bg-[#3674B5] selection:text-white">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 md:pt-12 pb-16 md:pb-24 relative z-10 space-y-12 md:space-y-24">
        
        {/* Page Header */}
        <div className="text-center space-y-3 md:space-y-5 max-w-3xl mx-auto border-b border-[#1E293B]/10 pb-6 md:pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3674B5] animate-pulse" />
            <span className="text-[9px] md:text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
              About Our Brand &amp; Enterprise Vision
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#1E293B] tracking-tight leading-tight">
            RAVTRON<span className="text-[#3674B5]">®</span>
          </h1>
          <p className="text-xs sm:text-base font-semibold text-[#1E293B]/60 max-w-xl mx-auto leading-relaxed">
            Exploring Ways To Connectivity — Building Next-Generation Products for Enterprises &amp; Modern Workspaces.
          </p>
        </div>

        {/* Section 1: Brand Introduction with 4-Product Merger Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#3674B5]" />
              <span className="text-[9px] md:text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
                Corporate Profile
              </span>
            </div>
            
            <h2 className="font-display font-black text-xl sm:text-4xl text-[#1E293B] tracking-tight leading-tight">
              Seamless Connectivity for <span className="text-[#3674B5]">Enterprises &amp; Smart Homes.</span>
            </h2>
            
            <p className="text-xs sm:text-base font-semibold text-[#1E293B]/70 leading-relaxed">
              RAVTRON® is a globally recognized OEM manufacturer specializing in IT, Mobility, Telecommunication, Networking, Multimedia, Surveillance, Security and Lifestyle Utility Products &amp; Solutions. Established by KSG Automation Pvt Ltd (India), we are committed to delivering seamless connectivity, enhanced security, and cutting-edge technology to Enterprises, SMBs, and Smart Homes worldwide.
            </p>
            
            <p className="text-xs sm:text-sm font-semibold text-[#1E293B]/50 leading-relaxed">
              With our headquarter in Gurugram, India, and strategic branches in China, Singapore, and the USA, RAVTRON® has rapidly emerged as a trusted industry leader, setting new standards in intelligent connectivity and mobility solutions.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-[#1E293B] bg-white border border-[#1E293B]/10 px-3 py-1.5 rounded-full shadow-3xs">
                <Building2 className="w-3.5 h-3.5 text-[#3674B5]" /> Gurugram HQ (India)
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-[#1E293B] bg-white border border-[#1E293B]/10 px-3 py-1.5 rounded-full shadow-3xs">
                <Globe className="w-3.5 h-3.5 text-[#3674B5]" /> China • Singapore • USA
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-[#1E293B] bg-white border border-[#1E293B]/10 px-3 py-1.5 rounded-full shadow-3xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Official OEM Supplier
              </span>
            </div>
          </div>

          {/* Merger Card 1: 4 Core Enterprise Connectivity Products */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl md:rounded-[2.5rem] bg-[#F8F9FA] border border-[#1E293B]/10 p-3.5 md:p-5 shadow-xl hover-lift duration-500 space-y-3.5">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3674B5] animate-pulse" />
                  <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">
                    Enterprise Connectivity Suite
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-[#3674B5] bg-[#3674B5]/10 px-2.5 py-0.5 rounded-full border border-[#3674B5]/20">
                  4 Featured Lineups
                </span>
              </div>

              {/* 2x2 Product Merger Mosaic */}
              <div className="grid grid-cols-2 gap-3">
                {displayGroup1.map((prod, idx) => (
                  <div 
                    key={prod.id || idx}
                    onClick={() => router.push(`/product/${prod.id || prod._id}`)}
                    className="group/card bg-white border border-[#1E293B]/10 hover:border-[#3674B5]/40 rounded-2xl p-2.5 transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative w-full h-24 sm:h-28 rounded-xl bg-[#F8F9FA] overflow-hidden flex items-center justify-center p-1.5 border border-[#1E293B]/5">
                      <img 
                        src={prod.image || "/logo.png"} 
                        alt={prod.name}
                        className="w-full h-full object-cover rounded-lg group-hover/card:scale-108 transition-transform duration-500"
                      />
                      <span className="absolute top-1 right-1 bg-black/75 backdrop-blur-xs text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                        {prod.category || "Solutions"}
                      </span>
                    </div>
                    <div className="pt-2 space-y-0.5">
                      <h5 className="font-display font-extrabold text-[11px] sm:text-xs text-[#1E293B] group-hover/card:text-[#3674B5] transition-colors truncate">
                        {prod.name}
                      </h5>
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#1E293B]/60">
                        <span className="text-[#3674B5]">₹{prod.price}</span>
                        <span className="text-[9px] text-[#3674B5] font-black group-hover/card:translate-x-0.5 transition-transform">View →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Merger Footer Banner */}
              <div className="bg-[#3674B5]/10 border border-[#3674B5]/20 rounded-xl p-2.5 text-center flex items-center justify-between text-[10px] font-bold text-[#3674B5] px-3">
                <span className="flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5" /> High-Performance Certified</span>
                <span className="font-black">Official RAVTRON®</span>
              </div>

            </div>
          </div>

        </div>

        {/* Section 2: Innovation & Inception with 4-Product Merger Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3674B5]" />
              <span className="text-[9px] md:text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
                Driven by Innovation, Defined by Excellence
              </span>
            </div>
            
            <h2 className="font-display font-black text-xl sm:text-4xl text-[#1E293B] tracking-tight leading-tight">
              Shaping the Future <span className="text-[#3674B5]">of Product Innovation.</span>
            </h2>
            
            <p className="text-xs sm:text-base font-semibold text-[#1E293B]/70 leading-relaxed">
              Since our inception in 2016, RAVTRON® has been at the forefront of technological evolution, delivering high-performance, reliable, and cost-effective solutions. Our unwavering commitment to quality, innovation, and sustainability ensures that businesses and homes remain securely and efficiently connected in today’s dynamic digital landscape.
            </p>
            
            <p className="text-xs sm:text-sm font-semibold text-[#1E293B]/50 leading-relaxed">
              Through relentless R&amp;D, strategic collaborations, and a customer-first approach, we continue to redefine global connectivity, shaping the future with cutting-edge solutions that power progress.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white border border-[#1E293B]/10 p-3 rounded-2xl shadow-3xs">
                <span className="block text-xs font-black text-[#3674B5]">EST. 2016</span>
                <span className="text-[10px] font-bold text-[#1E293B]/60">A Decade of Excellence</span>
              </div>
              <div className="bg-white border border-[#1E293B]/10 p-3 rounded-2xl shadow-3xs">
                <span className="block text-xs font-black text-[#3674B5]">HIGH-SPEED SIGNAL</span>
                <span className="text-[10px] font-bold text-[#1E293B]/60">4K Video &amp; 10Gbps LAN</span>
              </div>
              <div className="bg-white border border-[#1E293B]/10 p-3 rounded-2xl shadow-3xs col-span-2 sm:col-span-1">
                <span className="block text-xs font-black text-[#3674B5]">100+ PRODUCTS</span>
                <span className="text-[10px] font-bold text-[#1E293B]/60">Catalog Collections</span>
              </div>
            </div>
          </div>

          {/* Merger Card 2: 4 Core Workspace & Security Products */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-2xl md:rounded-[2.5rem] bg-[#F8F9FA] border border-[#1E293B]/10 p-3.5 md:p-5 shadow-xl hover-lift duration-500 space-y-3.5">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3674B5] animate-pulse" />
                  <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">
                    Workspace &amp; Security Ecosystem
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-[#3674B5] bg-[#3674B5]/10 px-2.5 py-0.5 rounded-full border border-[#3674B5]/20">
                  4 Core Utilities
                </span>
              </div>

              {/* 2x2 Product Merger Mosaic */}
              <div className="grid grid-cols-2 gap-3">
                {displayGroup2.map((prod, idx) => (
                  <div 
                    key={prod.id || idx}
                    onClick={() => router.push(`/product/${prod.id || prod._id}`)}
                    className="group/card bg-white border border-[#1E293B]/10 hover:border-[#3674B5]/40 rounded-2xl p-2.5 transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative w-full h-24 sm:h-28 rounded-xl bg-[#F8F9FA] overflow-hidden flex items-center justify-center p-1.5 border border-[#1E293B]/5">
                      <img 
                        src={prod.image || "/logo.png"} 
                        alt={prod.name}
                        className="w-full h-full object-cover rounded-lg group-hover/card:scale-108 transition-transform duration-500"
                      />
                      <span className="absolute top-1 right-1 bg-black/75 backdrop-blur-xs text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                        {prod.category || "Utility"}
                      </span>
                    </div>
                    <div className="pt-2 space-y-0.5">
                      <h5 className="font-display font-extrabold text-[11px] sm:text-xs text-[#1E293B] group-hover/card:text-[#3674B5] transition-colors truncate">
                        {prod.name}
                      </h5>
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#1E293B]/60">
                        <span className="text-[#3674B5]">₹{prod.price}</span>
                        <span className="text-[9px] text-[#3674B5] font-black group-hover/card:translate-x-0.5 transition-transform">View →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Merger Footer Banner */}
              <div className="bg-[#3674B5]/10 border border-[#3674B5]/20 rounded-xl p-2.5 text-center flex items-center justify-between text-[10px] font-bold text-[#3674B5] px-3">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Premium Quality Assured</span>
                <span className="font-black">Official RAVTRON®</span>
              </div>

            </div>
          </div>

        </div>

        {/* Graphic Infographic Grid: 4 Core Pillars of RAVTRON Ecosystem */}
        <div className="space-y-6 pt-6 border-t border-[#1E293B]/10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-widest bg-[#3674B5]/10 px-3 py-1 rounded-full border border-[#3674B5]/25">
              Technical Excellence
            </span>
            <h3 className="font-display font-black text-xl sm:text-3xl text-[#1E293B]">
              The RAVTRON® Product Ecosystem Standard
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#1E293B]/10 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs hover-lift transition-all duration-300 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#3674B5]/10 border border-[#3674B5]/20 flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider block">{item.subtitle}</span>
                  <h4 className="font-display font-black text-base text-[#1E293B]">{item.title}</h4>
                  <p className="text-xs font-semibold text-[#1E293B]/50 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Why Choose Us & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pt-6 md:pt-8 border-t border-[#1E293B]/10">
          
          {/* Why Choose Us */}
          <div className="lg:col-span-6 space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/30">
              <span className="text-[9px] md:text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
                Why Choose RAVTRON®?
              </span>
            </div>
            
            <h3 className="font-display font-black text-lg sm:text-3xl text-[#1E293B] tracking-tight leading-tight">
              Redefining Connectivity with Innovation &amp; Excellence
            </h3>
            
            <p className="text-xs sm:text-base font-semibold text-[#1E293B]/70 leading-relaxed">
              At RAVTRON®, we go beyond connectivity—we empower possibilities. Our commitment to uncompromising quality, technological advancement, and a global vision sets us apart. Our solutions are meticulously engineered to exceed international benchmarks, delivering seamless, secure, and high-performance networking for a smarter, more connected world.
            </p>
            
            <p className="text-xs sm:text-sm font-semibold text-[#1E293B]/50 leading-relaxed">
              As a forward-thinking brand, we continuously integrate next-generation technologies to enhance efficiency, scalability, and user experience. Our sustainability-driven approach ensures that innovation not only fuels progress but also contributes to a greener, more responsible future.
            </p>
          </div>

          {/* Mission & Pillars */}
          <div className="lg:col-span-6 space-y-4 md:space-y-6 mt-6 lg:mt-0">
            <h3 className="font-display font-black text-lg sm:text-2xl text-[#1E293B] tracking-tight">
              Our Core Mission
            </h3>
            
            <p className="text-xs sm:text-base font-semibold text-[#1E293B]/60 leading-relaxed">
              At RAVTRON®, our mission is to create exceptional value through breakthrough innovations, sustainable technology, and an unwavering customer-centric approach. We strive to establish RAVTRON® as the global benchmark for intelligent connectivity, driven by:
            </p>

            <div className="space-y-3 pt-1">
              {pillars.map((pillar, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3.5 p-4 rounded-xl md:rounded-2xl bg-white border border-[#1E293B]/10 shadow-3xs hover:border-[#3674B5]/30 transition-colors"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#F8F9FA] border border-[#1E293B]/5 flex items-center justify-center flex-shrink-0">
                    {pillar.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs md:text-sm font-bold text-[#1E293B]">{pillar.title}</h4>
                    <p className="text-[11px] md:text-xs text-[#1E293B]/50 leading-relaxed font-semibold">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Section 4: Final CTA Banner */}
        <div className="relative rounded-2xl md:rounded-[3rem] bg-gradient-to-r from-[#3674B5] to-[#578FCA] text-white p-6 md:p-12 overflow-hidden shadow-xl text-center space-y-4 md:space-y-6">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          
          <h3 className="font-display font-black text-lg sm:text-3xl lg:text-4xl text-white tracking-tight max-w-3xl mx-auto leading-tight">
            At RAVTRON®, we don’t just connect devices—we empower possibilities.
          </h3>
          
          <p className="text-[10px] sm:text-sm text-white/90 font-bold max-w-lg mx-auto uppercase tracking-wider">
            Join us in shaping the future of intelligent connectivity &amp; mobility.
          </p>

          <div className="pt-2 md:pt-4">
            <button
              onClick={() => router.push("/shop")}
              className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-full bg-white hover:bg-[#F8F9FA] text-[#3674B5] text-xs font-black transition-all duration-300 hover:scale-[1.03] active:scale-97 shadow-lg"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 text-[#3674B5]" />
            </button>
          </div>
        </div>

      </main>

      <Footer />
      <SearchModal />
    </div>
  );
}
