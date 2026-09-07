'use client';

import React from 'react';
import { WifiOff, RotateCcw, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-bg-brand hero-radial-bg">
      {/* Background ambient radial gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sage/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-clay/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-md w-full glass-panel rounded-3xl p-8 text-center flex flex-col items-center gap-6 shadow-2xl">
        
        {/* Pulse Animated Connection Icon */}
        <div className="w-20 h-20 rounded-full bg-slate-100/10 flex items-center justify-center text-[#3674B5] relative shadow-inner animate-pulse">
          <WifiOff className="w-10 h-10" />
          <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900"></div>
        </div>

        {/* Brand Identity */}
        <div className="flex items-center justify-center mt-2">
          <img 
            src="/logo.png" 
            alt="RAVTRON®" 
            className="h-[24px] w-auto object-contain mix-blend-multiply"
          />
        </div>

        {/* Status Details */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-display font-extrabold text-[#1E293B] tracking-tight">
            Connection Lost
          </h1>
          <p className="text-sm text-slate-500 font-sans leading-relaxed">
            It looks like you are currently offline. Check your network connection or tap reconnect to reload cached pages.
          </p>
        </div>

        {/* Actions Layout */}
        <div className="flex flex-col gap-3 w-full mt-4">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#3674B5] hover:bg-[#578FCA] text-white rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Reconnecting</span>
          </button>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl text-xs font-semibold transition-all hover:scale-102 active:scale-98"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl text-xs font-semibold transition-all hover:scale-102 active:scale-98"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop</span>
            </Link>
          </div>
        </div>

        {/* Tech Branding Footer */}
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
          RAVTRON Products • Offline Cache Mode
        </p>
      </div>
    </div>
  );
}
