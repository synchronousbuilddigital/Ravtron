"use client";

import React, { useState, useEffect } from "react";
import { Plug, Monitor, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const [animationState, setAnimationState] = useState("retracted");
  const [disconnectedIndex, setDisconnectedIndex] = useState(0);
  const [connectedIndex, setConnectedIndex] = useState(0);

  const defaultSlides = [
    {
      disconnected: "/logo.png",
      connected: "/logo.png",
      productId: "p3",
      tag1: "Pro HDMI 2.1", tag1Desc: "8K Resolution",
      tag2: "Docking Hub", tag2Desc: "10-in-1 output",
      tag3: "CAT6 SFTP", tag3Desc: "10Gbps Speed"
    },
    {
      disconnected: "/logo.png",
      connected: "/logo.png",
      productId: "p4",
      tag1: "4K Adapter", tag1Desc: "Ultra HD Signal",
      tag2: "Ring Webcam", tag2Desc: "4K Video Stream",
      tag3: "Power Cord", tag3Desc: "Heavy Duty"
    },
    {
      disconnected: "/logo.png",
      connected: "/logo.png",
      productId: "p5",
      tag1: "Privacy Filter", tag1Desc: "Anti-Glare 60°",
      tag2: "Cat6 Patch", tag2Desc: "10Gbps Speed",
      tag3: "USB-C Cable", tag3Desc: "High Speed PD"
    }
  ];

  // Always initialize with defaultSlides — same on server AND client (prevents hydration error)
  const [products, setProducts] = useState(defaultSlides);
  const [isLoading, setIsLoading] = useState(true);
  const productsRef = React.useRef([]);

  // hasMounted prevents defaultSlides from flashing before correct slides are applied from cache
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Runs immediately after mount — reads localStorage synchronously before any paint
  useEffect(() => {
    // Apply cached slides first (near-instant, before API response)
    try {
      const cached = localStorage.getItem("hero_slides_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }
    } catch (e) {}
    // Reveal hero now that correct slides are in place
    setHasMounted(true);
  }, []);

  useEffect(() => {
    async function loadHeroSlides() {
      try {
        const [resHero, resProducts] = await Promise.all([
          fetch("/api/hero"),
          fetch("/api/products")
        ]);

        if (resHero.ok && resProducts.ok) {
          const heroData = await resHero.json();
          const activeProducts = await resProducts.json();
          const activeProductIds = new Set(activeProducts.map((p) => p.id));

          // Merge custom database slides with default slides
          const merged = defaultSlides.map((defSlide, idx) => {
            const dbSlide = Array.isArray(heroData) ? heroData.find((s) => s.slideIndex === idx) : null;
            return dbSlide || defSlide;
          });

          // Filter out slides referencing deleted products
          let filtered = merged.filter((slide) => activeProductIds.has(slide.productId));

          if (filtered.length === 0 && activeProducts.length > 0) {
            // Generate slides from active products if all referenced products are deleted
            const fallbackProducts = activeProducts.slice(0, 3);
            filtered = fallbackProducts.map((prod, idx) => {
              const defaultSlide = defaultSlides[idx] || defaultSlides[0];
              return {
                disconnected: prod.image || defaultSlide.disconnected,
                connected: (prod.gallery && prod.gallery[1]) || prod.image || defaultSlide.connected,
                productId: prod.id,
                tag1: prod.name.split(" ").slice(0, 3).join(" "),
                tag1Desc: prod.shortSpec || "High Quality",
                tag2: prod.category || "Shop Now",
                tag2Desc: "Featured Product",
                tag3: "Best Price",
                tag3Desc: `₹${prod.price}`
              };
            });
          }

          const finalSlides = filtered.length > 0 ? filtered : defaultSlides;

          // Save confirmed slides to localStorage so next refresh shows correct data instantly
          try {
            localStorage.setItem("hero_slides_cache", JSON.stringify(finalSlides));
          } catch (e) {}

          setProducts(finalSlides);
        }
      } catch (err) {
        console.error("Error loading hero slides:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHeroSlides();
  }, []);

  useEffect(() => {
    let active = true;
    let timerId = null;

    const runSequence = () => {
      if (!active) return;

      if (productsRef.current.length === 0) {
        timerId = setTimeout(runSequence, 200);
        return;
      }

      setAnimationState("retracted");


      timerId = setTimeout(() => {
        if (!active) return;
        setAnimationState("connecting");


        timerId = setTimeout(() => {
          if (!active) return;
          setAnimationState("connected");

          timerId = setTimeout(() => {
            if (!active) return;
            setAnimationState("disconnecting");
            setDisconnectedIndex((prev) => (prev + 1) % productsRef.current.length);

            timerId = setTimeout(() => {
              if (!active) return;
              setAnimationState("retracted");
              setConnectedIndex((prev) => (prev + 1) % productsRef.current.length);

              timerId = setTimeout(() => {
                if (active) {
                  runSequence();
                }
              }, 800);

            }, 1000);
          }, 3200);
        }, 1000);
      }, 2000);
    };

    runSequence();

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  return (
    <section
      id="home"
      className="hero-radial-bg pt-6 pb-4 md:pt-16 md:pb-16 px-4 sm:px-8 lg:px-16 overflow-hidden relative"
    >
      {/* Dynamic Cable Connection Animation Background - Desktop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-95 hidden md:block translate-y-8">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
          {/* Gradients */}
          <defs>
            <linearGradient id="left-cable-grad" x1="-100" y1="730" x2="620" y2="730" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="60%" stopColor="#3674B5" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="right-cable-grad" x1="820" y1="730" x2="1540" y2="730" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="40%" stopColor="#DEC89E" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="metal-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="40%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="gold-plated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFECA1" />
              <stop offset="50%" stopColor="#D9B46C" />
              <stop offset="100%" stopColor="#B58F4A" />
            </linearGradient>
            <radialGradient id="connection-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="65%" stopColor="#DEC89E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Faint background grid lines */}
          <path d="M 0 730 L 1440 730" stroke="#3674B5" strokeWidth="1" strokeDasharray="8 8" opacity="0.08" />

          {/* PCB Circuit Tracks (Background Details) */}
          <g
            style={{
              opacity: (animationState === "connected") ? 0.35 : 0.08,
              transition: "opacity 0.8s ease-in-out",
              filter: (animationState === "connected") ? "drop-shadow(0 0 3px rgba(54, 116, 181, 0.3))" : "none"
            }}
          >
            {/* Track 1 (Left Wing Top) */}
            <path d="M 720 730 L 600 610 L 400 610 L 250 460 L -100 460" stroke="#3674B5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Track 2 (Left Wing Bottom) */}
            <path d="M 720 730 L 640 810 L -100 810" stroke="#DEC89E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Track 3 (Right Wing Top) */}
            <path d="M 720 730 L 840 610 L 1040 610 L 1190 460 L 1540 460" stroke="#3674B5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Track 4 (Right Wing Bottom) */}
            <path d="M 720 730 L 800 810 L 1540 810" stroke="#DEC89E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Track 5 (Center Upward Spine) */}
            <path d="M 720 730 L 720 200 L 680 160 L 680 -50" stroke="#3674B5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Track 6 (Center Upward Spine Branch) */}
            <path d="M 720 450 L 760 410 L 760 -50" stroke="#3674B5" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Soldered Motherboard Joints / Node Dots */}
            <circle cx="600" cy="610" r="2.5" fill="#3674B5" />
            <circle cx="400" cy="610" r="2.5" fill="#3674B5" />
            <circle cx="250" cy="460" r="2.5" fill="#3674B5" />
            <circle cx="640" cy="810" r="2.5" fill="#DEC89E" />

            <circle cx="840" cy="610" r="2.5" fill="#3674B5" />
            <circle cx="1040" cy="610" r="2.5" fill="#3674B5" />
            <circle cx="1190" cy="460" r="2.5" fill="#3674B5" />
            <circle cx="800" cy="810" r="2.5" fill="#DEC89E" />

            <circle cx="720" cy="200" r="2.5" fill="#3674B5" />
            <circle cx="680" cy="160" r="2.5" fill="#3674B5" />
            <circle cx="760" cy="410" r="2.5" fill="#3674B5" />
          </g>

          {/* Glowing Electric Light-Orbs (SMIL animateMotion) */}
          <g
            className={(animationState === "connected") ? "opacity-100" : "opacity-0"}
            style={{ transition: "opacity 0.6s ease-in-out" }}
          >
            <circle r="3.5" fill="#38BDF8" style={{ filter: "drop-shadow(0 0 5px #38BDF8)" }}>
              <animateMotion
                path="M 720 730 L 600 610 L 400 610 L 250 460 L -100 460"
                dur="4s"
                begin="0s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="3.5" fill="#FFECA1" style={{ filter: "drop-shadow(0 0 5px #FFECA1)" }}>
              <animateMotion
                path="M 720 730 L 640 810 L -100 810"
                dur="4.5s"
                begin="1.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="3.5" fill="#38BDF8" style={{ filter: "drop-shadow(0 0 5px #38BDF8)" }}>
              <animateMotion
                path="M 720 730 L 840 610 L 1040 610 L 1190 460 L 1540 460"
                dur="3.8s"
                begin="0.6s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="3.5" fill="#FFECA1" style={{ filter: "drop-shadow(0 0 5px #FFECA1)" }}>
              <animateMotion
                path="M 720 730 L 800 810 L 1540 810"
                dur="4.8s"
                begin="1.8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="3.5" fill="#38BDF8" style={{ filter: "drop-shadow(0 0 5px #38BDF8)" }}>
              <animateMotion
                path="M 720 730 L 720 200 L 680 160 L 680 -50"
                dur="4.2s"
                begin="0.3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="3.5" fill="#38BDF8" style={{ filter: "drop-shadow(0 0 5px #38BDF8)" }}>
              <animateMotion
                path="M 720 450 L 760 410 L 760 -50"
                dur="3.5s"
                begin="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>



          {/* Glowing pulse rings at connection point */}
          <g
            className={(animationState === "connected") ? "animate-pulse-ring-once" : "opacity-0"}
            style={{ transformOrigin: "720px 730px" }}
          >
            <circle cx="0" cy="0" r="100" fill="url(#connection-glow)" />
          </g>
          <g
            className={(animationState === "connected") ? "animate-pulse-ring-once" : "opacity-0"}
            style={{ transformOrigin: "720px 730px", animationDelay: "0.4s" }}
          >
            <circle cx="0" cy="0" r="100" fill="url(#connection-glow)" />
          </g>
          <g
            className={(animationState === "connected") ? "animate-pulse-ring-stroke-once" : "opacity-0"}
            style={{ transformOrigin: "720px 730px" }}
          >
            <circle cx="0" cy="0" r="60" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
          </g>

          {/* Left Cable Group (Sleek USB-C Male Connector) */}
          <g
            style={{
              transform: (animationState === "connecting" || animationState === "connected") ? "translateX(14px)" : "translateX(-280px)",
              transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)"
            }}
          >
            <path d="M -1000 730 H -100 C 150 750 350 710 500 730 H 620" stroke="url(#left-cable-grad)" strokeWidth="7" strokeLinecap="round" />
            <path d="M -1000 730 H -100 C 150 750 350 710 500 730 H 620" stroke="#578FCA" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" opacity="0.75" />
            <path
              d="M -1000 730 H -100 C 150 750 350 710 500 730 H 620"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="15 45"
              className="animate-flow-left"
              style={{
                opacity: (animationState === "connected") ? 0.9 : 0,
                transition: "opacity 0.3s ease-in-out"
              }}
            />

            <rect x="606" y="724" width="5" height="12" rx="1.5" fill="#334155" />
            <rect x="614" y="723" width="6" height="14" rx="2" fill="#1E293B" />
            <rect x="623" y="722" width="7" height="16" rx="2" fill="#0F172A" />

            <rect x="633" y="719" width="36" height="22" rx="5" fill="url(#metal-dark)" stroke="#334155" strokeWidth="1.5" />
            <rect x="637" y="721" width="28" height="2" rx="1" fill="#64748B" opacity="0.4" />
            <circle cx="651" cy="730" r="2" fill="#38BDF8" className="animate-led" />

            <rect x="669" y="724" width="18" height="12" rx="3.5" fill="url(#gold-plated)" stroke="#D9B46C" strokeWidth="1" />
            <line x1="673" y1="730" x2="683" y2="730" stroke="#1E293B" strokeWidth="1" />
          </g>

          {/* Right Cable Group (Blocky HDMI Female Port) */}
          <g
            style={{
              transform: (animationState === "connecting" || animationState === "connected") ? "translateX(-14px)" : "translateX(280px)",
              transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)"
            }}
          >
            <path d="M 2440 730 H 1540 C 1290 710 1090 750 940 730 H 820" stroke="url(#right-cable-grad)" strokeWidth="9" strokeLinecap="round" />
            <path d="M 2440 730 H 1540 C 1290 710 1090 750 940 730 H 820" stroke="#DEC89E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" opacity="0.75" />
            <path
              d="M 2440 730 H 1540 C 1290 710 1090 750 940 730 H 820"
              stroke="#DEC89E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="15 45"
              className="animate-flow-right"
              style={{
                opacity: (animationState === "connected") ? 0.9 : 0,
                transition: "opacity 0.3s ease-in-out"
              }}
            />

            <rect x="819" y="723" width="5" height="14" rx="1.5" fill="#334155" />
            <rect x="810" y="722" width="6" height="16" rx="2" fill="#1E293B" />
            <rect x="800" y="721" width="7" height="18" rx="2" fill="#0F172A" />

            <rect x="734" y="714" width="46" height="32" rx="4" fill="url(#metal-dark)" stroke="#334155" strokeWidth="1.5" />
            <rect x="738" y="717" width="38" height="2" rx="1" fill="#64748B" opacity="0.4" />
            <circle cx="757" cy="730" r="2" fill="#FBBF24" className="animate-led" />

            <rect x="711" y="720" width="6" height="20" rx="1.5" fill="url(#gold-plated)" stroke="#D9B46C" strokeWidth="1" />
            <rect x="717" y="722" width="17" height="16" rx="1" fill="#060A12" />
          </g>

          {/* Connection Sparkle Flash */}
          <g
            style={{
              transform: "translate(720px, 730px)",
              opacity: (animationState === "connected") ? 1 : 0,
              scale: (animationState === "connected") ? "1.4" : "0",
              transition: "opacity 0.2s ease-out, scale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
          >
            <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="24" fill="#38BDF8" opacity="0.5" />
            <circle cx="0" cy="0" r="48" fill="#FBBF24" opacity="0.25" />
            <path d="M -30 0 L 30 0 M 0 -30 L 0 30" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M -20 -20 L 20 20 M -20 20 L 20 -20" stroke="#FBBF24" strokeWidth="1.5" />
          </g>

          {/* Floating tech particles in background */}
          <g className="tech-particles" opacity="0.5">
            <circle cx="200" cy="150" r="2" fill="#38BDF8" className="particle-float-1" />
            <circle cx="350" cy="600" r="3" fill="#DEC89E" className="particle-float-2" />
            <circle cx="580" cy="180" r="1.5" fill="#38BDF8" className="particle-float-3" />
            <circle cx="850" cy="620" r="2.5" fill="#38BDF8" className="particle-float-1" />
            <circle cx="1100" cy="220" r="2" fill="#DEC89E" className="particle-float-2" />
            <circle cx="1250" cy="550" r="3.5" fill="#38BDF8" className="particle-float-3" />
            <circle cx="950" cy="120" r="1.5" fill="#FBBF24" className="particle-float-2" />
            <circle cx="150" cy="500" r="2" fill="#38BDF8" className="particle-float-3" />
          </g>
        </svg>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes pulse-ring-grows-once {
            0% { transform: translate(720px, 730px) scale(0.1); opacity: 0; }
            10% { transform: translate(720px, 730px) scale(0.2); opacity: 1; }
            100% { transform: translate(720px, 730px) scale(3.5); opacity: 0; }
          }
          @keyframes pulse-ring-stroke-once {
            0% { transform: translate(720px, 730px) scale(0.1); opacity: 0; }
            10% { transform: translate(720px, 730px) scale(0.25); opacity: 0.8; }
            100% { transform: translate(720px, 730px) scale(3); opacity: 0; }
          }
          @keyframes flow-left-loop {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -60; }
          }
          @keyframes flow-right-loop {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: 60; }
          }
          @keyframes led-breathe {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          @keyframes particle-float-1 {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
            50% { transform: translateY(-30px) translateX(15px); opacity: 0.8; }
          }
          @keyframes particle-float-2 {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
            50% { transform: translateY(40px) translateX(-20px); opacity: 0.9; }
          }
          @keyframes particle-float-3 {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
            50% { transform: translateY(-20px) translateX(-25px); opacity: 0.7; }
          }

          .animate-pulse-ring-once {
            animation: pulse-ring-grows-once 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-pulse-ring-stroke-once {
            animation: pulse-ring-stroke-once 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-flow-left {
            animation: flow-left-loop 2s linear infinite;
          }
          .animate-flow-right {
            animation: flow-right-loop 2s linear infinite;
          }
          .animate-led {
            animation: led-breathe 2s ease-in-out infinite;
          }
          .particle-float-1 { animation: particle-float-1 7s ease-in-out infinite; }
          .particle-float-2 { animation: particle-float-2 9s ease-in-out infinite; }
          .particle-float-3 { animation: particle-float-3 11s ease-in-out infinite; }
        `}} />
      </div>



      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-8 items-center relative z-10">

        {/* Left Text Column */}
        <div className="lg:col-span-6 flex flex-col items-start text-left space-y-3 md:space-y-6 max-w-xl">


          {/* Big Headline */}
          <h1 className="font-display font-black text-[21px] xs:text-2xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] text-[#1E293B]">
            Connecting Every <span className="text-[#3674B5]">Device</span>.<br className="hidden sm:inline" /> Powering Every Business.
          </h1>

          {/* CTA Buttons (Desktop) */}
          <div className="hidden md:flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold shadow-lg transition-all hover:scale-105 active:scale-95 text-center"
            >
              Explore Products
            </Link>
          </div>

        </div>

        {/* Right Image Column — hidden until correct slides are confirmed from cache */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center lg:justify-end gap-3 md:gap-0 mt-0 lg:mt-0"
          style={{ opacity: hasMounted ? 1 : 0, transition: "opacity 0.2s ease-in" }}
        >
          <div className="relative z-10 w-full max-w-[480px] lg:max-w-[450px]">

            {/* Floating Ambient Glow Background Ring */}
            <div className="absolute inset-0 bg-[#E5D0C6]/40 rounded-full blur-3xl scale-95 z-0"></div>

            {/* Realistic Hero Image Frame */}
            <Link href={(animationState === "connected" ? products[connectedIndex]?.productId : products[disconnectedIndex]?.productId) ? `/product/${(animationState === "connected" ? products[connectedIndex]?.productId : products[disconnectedIndex]?.productId)}` : "/shop"}>
              <div className="relative z-10 rounded-[2rem] bg-[#F8F9FA] p-3 shadow-xl border border-white/40 overflow-hidden cursor-pointer group hover:scale-[1.02] hover:shadow-2xl transition-all duration-700 h-[280px] sm:h-[320px] lg:h-[400px]">
                {/* Disconnected Image */}
                <Image
                  src={products[disconnectedIndex]?.disconnected || "/logo.png"}
                  alt="RAVTRON B2B Solutions"
                  fill
                  priority
                  sizes="(max-width: 640px) 450px, 450px"
                  className="rounded-[2rem] object-contain p-4"
                  style={{
                    opacity: (animationState === "connected") ? 0 : 1,
                    transform: (animationState === "connected") ? "scale(0.95)" : "scale(1)",
                    transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out"
                  }}
                />
                {/* Connected Image */}
                <Image
                  src={products[connectedIndex]?.connected || "/logo.png"}
                  alt="RAVTRON Connected Active State"
                  fill
                  priority
                  sizes="(max-width: 640px) 450px, 450px"
                  className="rounded-[2rem] object-contain p-4"
                  style={{
                    opacity: (animationState === "connected") ? 1 : 0,
                    transform: (animationState === "connected") ? "scale(1)" : "scale(1.05)",
                    transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out"
                  }}
                />
              </div>
            </Link>

            {/* Floating Info Chips (Desktop Only) */}
            <div className="hidden md:flex absolute -top-4 -left-4 z-20 glass-pill px-4.5 py-2.5 rounded-2xl shadow-lg border flex items-center gap-2 hover:scale-105 transition-all">
              <span className="p-1.5 rounded-lg bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center">
                <Plug className="w-4 h-4 fill-current" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1E293B] transition-all">
                  {animationState === "connected" ? products[connectedIndex]?.tag1 : products[disconnectedIndex]?.tag1}
                </h4>
                <p className="text-[10px] text-[#1E293B]/60">
                  {animationState === "connected" ? products[connectedIndex]?.tag1Desc : products[disconnectedIndex]?.tag1Desc}
                </p>
              </div>
            </div>

            <div className="hidden md:flex absolute top-[45%] -right-6 z-20 glass-pill px-4.5 py-2.5 rounded-2xl shadow-lg border flex items-center gap-2 hover:scale-105 transition-all">
              <span className="p-1.5 rounded-lg bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1E293B] transition-all">
                  {animationState === "connected" ? products[connectedIndex]?.tag2 : products[disconnectedIndex]?.tag2}
                </h4>
                <p className="text-[10px] text-[#1E293B]/60">
                  {animationState === "connected" ? products[connectedIndex]?.tag2Desc : products[disconnectedIndex]?.tag2Desc}
                </p>
              </div>
            </div>

            <div className="hidden md:flex absolute -bottom-4 left-[20%] z-20 glass-pill px-4.5 py-2.5 rounded-2xl shadow-lg border flex items-center gap-2 hover:scale-105 transition-all">
              <span className="p-1.5 rounded-lg bg-[#DEC89E]/20 text-[#DEC89E] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#1E293B] transition-all">
                  {animationState === "connected" ? products[connectedIndex]?.tag3 : products[disconnectedIndex]?.tag3}
                </h4>
                <p className="text-[10px] text-[#1E293B]/60">
                  {animationState === "connected" ? products[connectedIndex]?.tag3Desc : products[disconnectedIndex]?.tag3Desc}
                </p>
              </div>
            </div>

          </div>

          {/* Feature Badges (Mobile Only - Row below the frame to prevent overlap) */}
          <div className="flex md:hidden flex-wrap items-center justify-center gap-2 mt-4 w-full max-w-[480px] relative z-10">
            <div className="glass-pill px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-sm">
              <span className="p-1.5 rounded-lg bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center">
                <Plug className="w-3.5 h-3.5 fill-current" />
              </span>
              <div className="text-left">
                <h4 className="text-[10px] font-extrabold text-[#1E293B] leading-tight">
                  {animationState === "connected" ? products[connectedIndex]?.tag1 : products[disconnectedIndex]?.tag1}
                </h4>
                <p className="text-[8px] text-[#1E293B]/60 leading-none">
                  {animationState === "connected" ? products[connectedIndex]?.tag1Desc : products[disconnectedIndex]?.tag1Desc}
                </p>
              </div>
            </div>

            <div className="glass-pill px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-sm">
              <span className="p-1.5 rounded-lg bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center">
                <Monitor className="w-3.5 h-3.5" />
              </span>
              <div className="text-left">
                <h4 className="text-[10px] font-extrabold text-[#1E293B] leading-tight">
                  {animationState === "connected" ? products[connectedIndex]?.tag2 : products[disconnectedIndex]?.tag2}
                </h4>
                <p className="text-[8px] text-[#1E293B]/60 leading-none">
                  {animationState === "connected" ? products[connectedIndex]?.tag2Desc : products[disconnectedIndex]?.tag2Desc}
                </p>
              </div>
            </div>

            <div className="glass-pill px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-sm">
              <span className="p-1.5 rounded-lg bg-[#DEC89E]/20 text-[#DEC89E] flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </span>
              <div className="text-left">
                <h4 className="text-[10px] font-extrabold text-[#1E293B] leading-tight">
                  {animationState === "connected" ? products[connectedIndex]?.tag3 : products[disconnectedIndex]?.tag3}
                </h4>
                <p className="text-[8px] text-[#1E293B]/60 leading-none">
                  {animationState === "connected" ? products[connectedIndex]?.tag3Desc : products[disconnectedIndex]?.tag3Desc}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Cable Animation (Placed below the Feature Badges) */}
          <div className="block md:hidden w-full h-[90px] relative overflow-visible pointer-events-none select-none mt-4 mb-4 z-0">
            <svg className="absolute inset-0 w-full h-full" viewBox="530 685 380 90" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
              {/* Gradients */}
              <defs>
                <linearGradient id="left-cable-grad-mobile" x1="-100" y1="730" x2="620" y2="730" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="60%" stopColor="#3674B5" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                <linearGradient id="right-cable-grad-mobile" x1="820" y1="730" x2="1540" y2="730" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="40%" stopColor="#DEC89E" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                <linearGradient id="metal-dark-mobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="40%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id="gold-plated-mobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFECA1" />
                  <stop offset="50%" stopColor="#D9B46C" />
                  <stop offset="100%" stopColor="#B58F4A" />
                </linearGradient>
                <radialGradient id="connection-glow-mobile" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="65%" stopColor="#DEC89E" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Faint background grid lines */}
              <path d="M 0 730 L 1440 730" stroke="#3674B5" strokeWidth="1" strokeDasharray="8 8" opacity="0.08" />

              {/* PCB Circuit Tracks (Background Details) */}
              <g
                style={{
                  opacity: (animationState === "connected") ? 0.35 : 0.08,
                  transition: "opacity 0.8s ease-in-out",
                  filter: (animationState === "connected") ? "drop-shadow(0 0 3px rgba(54, 116, 181, 0.3))" : "none"
                }}
              >
                <path d="M 720 730 L 600 610 L 400 610 L 250 460 L -100 460" stroke="#3674B5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M 720 730 L 640 810 L -100 810" stroke="#DEC89E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M 720 730 L 840 610 L 1040 610 L 1190 460 L 1540 460" stroke="#3674B5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M 720 730 L 800 810 L 1540 810" stroke="#DEC89E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M 720 730 L 720 600 L 680 560 L 680 500" stroke="#3674B5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M 720 620 L 760 580 L 760 500" stroke="#3674B5" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                <circle cx="600" cy="610" r="2.5" fill="#3674B5" />
                <circle cx="400" cy="610" r="2.5" fill="#3674B5" />
                <circle cx="250" cy="460" r="2.5" fill="#3674B5" />
                <circle cx="640" cy="810" r="2.5" fill="#DEC89E" />

                <circle cx="840" cy="610" r="2.5" fill="#3674B5" />
                <circle cx="1040" cy="610" r="2.5" fill="#3674B5" />
                <circle cx="1190" cy="460" r="2.5" fill="#3674B5" />
                <circle cx="800" cy="810" r="2.5" fill="#DEC89E" />

                <circle cx="680" cy="500" r="2.5" fill="#3674B5" />
                <circle cx="760" cy="500" r="2.5" fill="#3674B5" />
                <circle cx="720" cy="620" r="2.5" fill="#3674B5" />
              </g>

              {/* Glowing Electric Light-Orbs (SMIL animateMotion) */}
              <g
                className={(animationState === "connected") ? "opacity-100" : "opacity-0"}
                style={{ transition: "opacity 0.6s ease-in-out" }}
              >
                <circle r="3.5" fill="#38BDF8" style={{ filter: "drop-shadow(0 0 5px #38BDF8)" }}>
                  <animateMotion
                    path="M 720 730 L 600 610 L 400 610 L 250 460 L -100 460"
                    dur="4s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="3.5" fill="#FFECA1" style={{ filter: "drop-shadow(0 0 5px #FFECA1)" }}>
                  <animateMotion
                    path="M 720 730 L 640 810 L -100 810"
                    dur="4.5s"
                    begin="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="3.5" fill="#38BDF8" style={{ filter: "drop-shadow(0 0 5px #38BDF8)" }}>
                  <animateMotion
                    path="M 720 730 L 840 610 L 1040 610 L 1190 460 L 1540 460"
                    dur="3.8s"
                    begin="0.6s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="3.5" fill="#FFECA1" style={{ filter: "drop-shadow(0 0 5px #FFECA1)" }}>
                  <animateMotion
                    path="M 720 730 L 800 810 L 1540 810"
                    dur="4.8s"
                    begin="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="3.5" fill="#38BDF8" style={{ filter: "drop-shadow(0 0 5px #38BDF8)" }}>
                  <animateMotion
                    path="M 720 730 L 720 600 L 680 560 L 680 500"
                    dur="4.2s"
                    begin="0.3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="3.5" fill="#38BDF8" style={{ filter: "drop-shadow(0 0 5px #38BDF8)" }}>
                  <animateMotion
                    path="M 720 620 L 760 580 L 760 500"
                    dur="3.5s"
                    begin="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* Glowing pulse rings at connection point */}
              <g
                className={(animationState === "connected") ? "animate-pulse-ring-once" : "opacity-0"}
                style={{ transformOrigin: "720px 730px" }}
              >
                <circle cx="0" cy="0" r="100" fill="url(#connection-glow-mobile)" />
              </g>
              <g
                className={(animationState === "connected") ? "animate-pulse-ring-once" : "opacity-0"}
                style={{ transformOrigin: "720px 730px", animationDelay: "0.4s" }}
              >
                <circle cx="0" cy="0" r="100" fill="url(#connection-glow-mobile)" />
              </g>
              <g
                className={(animationState === "connected") ? "animate-pulse-ring-stroke-once" : "opacity-0"}
                style={{ transformOrigin: "720px 730px" }}
              >
                <circle cx="0" cy="0" r="60" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
              </g>

              {/* Left Cable Group (Sleek USB-C Male Connector) */}
              <g
                style={{
                  transform: (animationState === "connecting" || animationState === "connected") ? "translateX(14px)" : "translateX(-280px)",
                  transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)"
                }}
              >
                <path d="M -1000 730 H -100 C 150 750 350 710 500 730 H 620" stroke="url(#left-cable-grad-mobile)" strokeWidth="7" strokeLinecap="round" />
                <path d="M -1000 730 H -100 C 150 750 350 710 500 730 H 620" stroke="#578FCA" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" opacity="0.75" />
                <path
                  d="M -1000 730 H -100 C 150 750 350 710 500 730 H 620"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="15 45"
                  className="animate-flow-left"
                  style={{
                    opacity: (animationState === "connected") ? 0.9 : 0,
                    transition: "opacity 0.3s ease-in-out"
                  }}
                />

                <rect x="606" y="724" width="5" height="12" rx="1.5" fill="#334155" />
                <rect x="614" y="723" width="6" height="14" rx="2" fill="#1E293B" />
                <rect x="623" y="722" width="7" height="16" rx="2" fill="#0F172A" />

                <rect x="633" y="719" width="36" height="22" rx="5" fill="url(#metal-dark-mobile)" stroke="#334155" strokeWidth="1.5" />
                <rect x="637" y="721" width="28" height="2" rx="1" fill="#64748B" opacity="0.4" />
                <circle cx="651" cy="730" r="2" fill="#38BDF8" className="animate-led" />

                <rect x="669" y="724" width="18" height="12" rx="3.5" fill="url(#gold-plated-mobile)" stroke="#D9B46C" strokeWidth="1" />
                <line x1="673" y1="730" x2="683" y2="730" stroke="#1E293B" strokeWidth="1" />
              </g>

              {/* Right Cable Group (Blocky HDMI Female Port) */}
              <g
                style={{
                  transform: (animationState === "connecting" || animationState === "connected") ? "translateX(-14px)" : "translateX(280px)",
                  transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)"
                }}
              >
                <path d="M 2440 730 H 1540 C 1290 710 1090 750 940 730 H 820" stroke="url(#right-cable-grad-mobile)" strokeWidth="9" strokeLinecap="round" />
                <path d="M 2440 730 H 1540 C 1290 710 1090 750 940 730 H 820" stroke="#DEC89E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" opacity="0.75" />
                <path
                  d="M 2440 730 H 1540 C 1290 710 1090 750 940 730 H 820"
                  stroke="#DEC89E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="15 45"
                  className="animate-flow-right"
                  style={{
                    opacity: (animationState === "connected") ? 0.9 : 0,
                    transition: "opacity 0.3s ease-in-out"
                  }}
                />

                <rect x="819" y="723" width="5" height="14" rx="1.5" fill="#334155" />
                <rect x="810" y="722" width="6" height="16" rx="2" fill="#1E293B" />
                <rect x="800" y="721" width="7" height="18" rx="2" fill="#0F172A" />

                <rect x="734" y="714" width="46" height="32" rx="4" fill="url(#metal-dark-mobile)" stroke="#334155" strokeWidth="1.5" />
                <rect x="738" y="717" width="38" height="2" rx="1" fill="#64748B" opacity="0.4" />
                <circle cx="757" cy="730" r="2" fill="#FBBF24" className="animate-led" />

                <rect x="711" y="720" width="6" height="20" rx="1.5" fill="url(#gold-plated-mobile)" stroke="#D9B46C" strokeWidth="1" />
                <rect x="717" y="722" width="17" height="16" rx="1" fill="#060A12" />
              </g>

              {/* Connection Sparkle Flash */}
              <g
                style={{
                  transform: "translate(720px, 730px)",
                  opacity: (animationState === "connected") ? 1 : 0,
                  scale: (animationState === "connected") ? "1.4" : "0",
                  transition: "opacity 0.2s ease-out, scale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }}
              >
                <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
                <circle cx="0" cy="0" r="24" fill="#38BDF8" opacity="0.5" />
                <circle cx="0" cy="0" r="48" fill="#FBBF24" opacity="0.25" />
                <path d="M -30 0 L 30 0 M 0 -30 L 0 30" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M -20 -20 L 20 20 M -20 20 L 20 -20" stroke="#FBBF24" strokeWidth="1.5" />
              </g>

              {/* Floating tech particles in background */}
              <g className="tech-particles" opacity="0.5">
                <circle cx="200" cy="150" r="2" fill="#38BDF8" className="particle-float-1" />
                <circle cx="350" cy="600" r="3" fill="#DEC89E" className="particle-float-2" />
                <circle cx="580" cy="180" r="1.5" fill="#38BDF8" className="particle-float-3" />
                <circle cx="850" cy="620" r="2.5" fill="#38BDF8" className="particle-float-1" />
                <circle cx="1100" cy="220" r="2" fill="#DEC89E" className="particle-float-2" />
                <circle cx="1250" cy="550" r="3.5" fill="#38BDF8" className="particle-float-3" />
                <circle cx="950" cy="120" r="1.5" fill="#FBBF24" className="particle-float-2" />
                <circle cx="150" cy="500" r="2" fill="#38BDF8" className="particle-float-3" />
              </g>
            </svg>

            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes pulse-ring-grows-once-mobile {
                0% { transform: translate(720px, 730px) scale(0.1); opacity: 0; }
                10% { transform: translate(720px, 730px) scale(0.2); opacity: 1; }
                100% { transform: translate(720px, 730px) scale(3.5); opacity: 0; }
              }
              @keyframes pulse-ring-stroke-once-mobile {
                0% { transform: translate(720px, 730px) scale(0.1); opacity: 0; }
                10% { transform: translate(720px, 730px) scale(0.25); opacity: 0.8; }
                100% { transform: translate(720px, 730px) scale(3); opacity: 0; }
              }

              .animate-pulse-ring-once {
                animation: pulse-ring-grows-once-mobile 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .animate-pulse-ring-stroke-once {
                animation: pulse-ring-stroke-once-mobile 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .animate-flow-left {
                animation: flow-left-loop 2s linear infinite;
              }
              .animate-flow-right {
                animation: flow-right-loop 2s linear infinite;
              }
              .animate-led {
                animation: led-breathe 2s ease-in-out infinite;
              }
              .particle-float-1 { animation: particle-float-1 7s ease-in-out infinite; }
              .particle-float-2 { animation: particle-float-2 9s ease-in-out infinite; }
              .particle-float-3 { animation: particle-float-3 11s ease-in-out infinite; }
            `}} />
          </div>

          {/* CTA Buttons (Mobile - Below the Cable Animation) */}
          <div className="flex md:hidden flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full max-w-[480px] z-20">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold shadow-lg transition-all hover:scale-105 active:scale-95 text-center"
            >
              Explore Products
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
