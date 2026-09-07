"use client";

import React, { useState, useEffect } from "react";

export default function Loading() {
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "Initializing RAVTRON® Connectivity...",
    "Configuring Signal Integrity...",
    "Optimizing Display Channels...",
    "Synchronizing Workspace Hubs...",
    "Connecting to RAVTRON® Network..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFFFFF] text-[#334155] overflow-hidden select-none">
      
      {/* Background Tech Circuit Tracks */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none">
          <defs>
            <linearGradient id="track-blue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3674B5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3674B5" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="track-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#DEC89E" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#DEC89E" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M -100 100 L 300 100 L 450 250 L 900 250 L 1050 400 L 1600 400" stroke="url(#track-blue)" strokeWidth="1.5" />
          <path d="M 1540 800 L 1140 800 L 990 650 L 450 650 L 300 500 L -100 500" stroke="url(#track-gold)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute w-2 h-2 rounded-full bg-[#3674B5] blur-xs animate-ping top-1/4 left-1/3" style={{ animationDuration: '4s' }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-[#DEC89E] blur-xs animate-ping bottom-1/4 right-1/4" style={{ animationDuration: '5s' }} />
        <div className="absolute w-1 h-1 rounded-full bg-[#3674B5] top-1/2 right-1/3 animate-pulse" style={{ animationDuration: '3s' }} />
      </div>

      {/* Center Logo & Loader */}
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center space-y-8 z-10">
        
        {/* Glowing Circle Bolt Loader Container */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          
          {/* Outer Rotating Glowing Dash Ring */}
          <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '6s' }} viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="44" 
              stroke="#3674B5" 
              strokeWidth="2.5" 
              strokeDasharray="40 180" 
              strokeLinecap="round" 
              fill="none" 
            />
          </svg>

          {/* Inner Counter-Rotating Dash Ring */}
          <svg className="absolute inset-0 w-full h-full animate-spin-reverse" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="38" 
              stroke="#DEC89E" 
              strokeWidth="2" 
              strokeDasharray="60 140" 
              strokeLinecap="round" 
              fill="none" 
              opacity="0.8"
            />
          </svg>

          {/* Background Ambient Radial Glow */}
          <div className="absolute w-16 h-16 rounded-full bg-[#3674B5]/8 blur-xl animate-pulse" />

          {/* Central Charging Bolt Icon */}
          <div className="relative z-10 text-[#3674B5] animate-pulse" style={{ animationDuration: '2s' }}>
            <svg 
              className="w-10 h-10 fill-current text-[#3674B5]" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 0 6px rgba(54, 116, 181, 0.25))" }}
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2.5">
          <h1 
            className="text-2xl font-extrabold tracking-[0.25em] text-[#1E293B] uppercase font-display font-black"
          >
            RAVTRON
          </h1>
          <p className="text-[10px] font-bold text-[#3674B5] tracking-[0.3em] uppercase opacity-90">
            Exploring Ways To Connectivity
          </p>
        </div>

        {/* Loading Progress Bar Container */}
        <div className="w-48 h-1 bg-[#1E293B]/10 rounded-full overflow-hidden relative">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#3674B5] via-[#578FCA] to-[#DEC89E] rounded-full animate-loading-bar" 
            style={{ width: '100%' }}
          />
        </div>

        {/* Dynamic Status Text */}
        <div className="h-6 flex items-center justify-center">
          <span 
            key={statusIndex}
            className="text-xs font-semibold text-[#475569] tracking-wide animate-fade-in-up"
            style={{ animationDuration: '0.6s' }}
          >
            {statuses[statusIndex]}
          </span>
        </div>

      </div>

      {/* Loader CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 4s linear infinite;
        }
        @keyframes loading-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes fadeInUpMini {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUpMini 0.5s ease-out forwards;
        }
      `}} />

    </div>
  );
}
