import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../app/context/CartContext";
import { Zap, ChevronDown, Grid, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const {
    cart,
    wishlist,
    setIsCartOpen,
    setIsSearchOpen,
    getCartCount,
    clearCartAndWishlist,
    categories: categoriesListFromContext
  } = useCart();

  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoriesMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsCategoriesOpen(true);
  };

  const handleCategoriesMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsCategoriesOpen(false);
    }, 200);
  };

  const defaultCategoriesData = [
    {
      name: "Cables",
      image: "/logo.png",
      subcategories: ["HDMI Cables", "VGA Cables", "Power Cords", "Converter Cables"]
    },
    {
      name: "Converters",
      image: "/logo.png",
      subcategories: ["HDMI", "VGA", "Display Port", "Mini DP", "Type C"]
    },
    {
      name: "Docking Stations",
      image: "/logo.png",
      subcategories: ["TYPE C", "USB", "Dual Type C"]
    },
    {
      name: "Accessories",
      image: "/logo.png",
      subcategories: ["Privacy Filter", "Webcam", "Power Adapter", "Laptop Stand"]
    },
    {
      name: "Audio Video",
      image: "/logo.png",
      subcategories: ["HDMI Extender", "HDMI Splitter", "HDMI Switcher", "Matrix"]
    },
    {
      name: "Networking",
      image: "/logo.png",
      subcategories: ["PATCH CORD", "CAT6 CABLE"]
    },
    {
      name: "Surveillance",
      image: "/logo.png",
      subcategories: ["CCTV Cables", "Power Supply", "PoE Switch", "BNC Connector"]
    },
    {
      name: "USB HUBS",
      image: "/logo.png",
      subcategories: ["TYPE C", "USB"]
    }
  ];

  const rawNavCategories = Array.isArray(categoriesListFromContext) && categoriesListFromContext.length > 0
    ? categoriesListFromContext
    : defaultCategoriesData;

  const categoriesToRender = React.useMemo(() => {
    return [...rawNavCategories].sort((a, b) => {
      const aPos = a.homePosition > 0 ? a.homePosition : 999;
      const bPos = b.homePosition > 0 ? b.homePosition : 999;
      if (aPos !== bPos) return aPos - bPos;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [rawNavCategories]);

  const handleSignOut = async () => {
    if (clearCartAndWishlist) clearCartAndWishlist();
    try {
      localStorage.removeItem("ravtron_session");
      localStorage.removeItem("ravtron_cart");
      localStorage.removeItem("ravtron_wishlist");
    } catch (e) {}
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Failed to sign out on server", e);
    }
    setUser(null);
    window.dispatchEvent(new Event("ravtron_auth_change"));
    window.location.href = "/";
  };

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href) || false;
  };

  useEffect(() => {
    // ── Step 1: Show user INSTANTLY from localStorage (zero flicker) ────────
    const cached = localStorage.getItem("ravtron_session");
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch (e) {}
    }

    // ── Step 2: Silently verify with the server ONCE in the background ───────
    // Uses sessionStorage flag so we only call /api/auth/me once per browser tab,
    // not on every page navigation or re-render.
    const alreadyVerified = sessionStorage.getItem("ravtron_auth_verified");
    if (!alreadyVerified) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          sessionStorage.setItem("ravtron_auth_verified", "1");
          if (data.isLoggedIn && data.user) {
            setUser(data.user);
            localStorage.setItem("ravtron_session", JSON.stringify(data.user));
          } else {
            setUser(null);
            localStorage.removeItem("ravtron_session");
          }
        })
        .catch(() => {
          // Network error — keep showing the cached user from localStorage
        });
    }

    // ── Step 3: Re-check on explicit auth events (login / logout) ────────────
    const handleAuthChange = () => {
      sessionStorage.removeItem("ravtron_auth_verified"); // Force re-verify on next check
      const session = localStorage.getItem("ravtron_session");
      if (session) {
        try { setUser(JSON.parse(session)); } catch (e) { setUser(null); }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("ravtron_auth_change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("ravtron_auth_change", handleAuthChange);
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/categories" },
    { name: "About Us", href: "/about" }
  ];

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hysteresis threshold to prevent scroll jitter/flicker at boundaries
      setIsScrolled((prev) => {
        if (window.scrollY > 60) return true;
        if (window.scrollY < 15) return false;
        return prev;
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky z-[90] w-full overflow-visible transition-all duration-500 ease-in-out ${isScrolled
          ? "top-2 sm:top-3 px-2.5 sm:px-6 lg:px-8"
          : "top-0 px-0"
        }`}>
        <nav className={`mx-auto flex items-center justify-between overflow-visible transition-all duration-500 ease-in-out relative ${isScrolled
            ? "max-w-5xl bg-white/95 backdrop-blur-md border border-[#1E293B]/10 rounded-2xl sm:rounded-full px-3.5 sm:px-6 py-2 shadow-lg hover:shadow-xl"
            : "max-w-full bg-white border-b border-[#1E293B]/10 rounded-none px-3.5 sm:px-12 py-3.5 sm:py-5 shadow-none"
          }`}>

          {/* Logo Brand */}
          <Link href="/" className="flex items-center group shrink-0 mr-2 sm:mr-6">
            <img
              src="/logo.png"
              alt="RAVTRON®"
              className="h-5 sm:h-9 w-auto max-w-[105px] xs:max-w-[125px] sm:max-w-none object-contain mix-blend-multiply transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              if (link.name === "Categories") {
                return (
                  <div
                    key={link.name}
                    className="relative py-1 group"
                    onMouseEnter={handleCategoriesMouseEnter}
                    onMouseLeave={handleCategoriesMouseLeave}
                  >
                    <Link
                      href={link.href}
                      className={`text-sm transition-colors relative py-1 inline-flex items-center gap-1 after:absolute after:bottom-0 after:h-[2px] after:bg-[#3674B5] after:transition-all ${active
                          ? "font-bold text-[#3674B5] after:w-full after:left-0"
                          : "font-semibold text-[#1E293B]/70 hover:text-[#1E293B] after:left-1/2 after:w-0 hover:after:w-full hover:after:left-0"
                        }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCategoriesOpen ? "rotate-180 text-[#3674B5]" : "text-[#1E293B]/50"}`} />
                    </Link>

                    {/* Mega Dropdown Menu for Categories */}
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[88vw] max-w-5xl bg-white/98 backdrop-blur-2xl border border-[#1E293B]/12 rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-300 z-[100] ${isCategoriesOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                        }`}
                      onMouseEnter={handleCategoriesMouseEnter}
                      onMouseLeave={handleCategoriesMouseLeave}
                    >
                      {/* Dropdown Header */}
                      <div className="flex items-center justify-between border-b border-[#1E293B]/10 pb-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/20 flex items-center justify-center text-[#3674B5]">
                            <Grid className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">RAVTRON Product Ecosystem</h4>
                            <p className="text-[10px] font-semibold text-[#1E293B]/50">Explore structured product collections with official specs</p>
                          </div>
                        </div>
                        <Link
                          href="/categories"
                          onClick={() => setIsCategoriesOpen(false)}
                          className="text-xs font-bold text-[#3674B5] hover:text-white hover:bg-[#3674B5] flex items-center gap-1.5 transition-all bg-[#3674B5]/8 px-3.5 py-1.5 rounded-full border border-[#3674B5]/20"
                        >
                          <span>Explore All Categories</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Structured Categories Grid (4 Columns) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5" suppressHydrationWarning>
                        {categoriesToRender.map((cat) => {
                          const imgPath = cat.image || "/logo.png";
                          return (
                            <div
                              key={cat.name}
                              className="group/item bg-[#F8F9FA] hover:bg-white border border-[#1E293B]/10 hover:border-[#3674B5]/30 rounded-2xl p-3.5 sm:p-4 transition-all duration-300 hover:shadow-xl flex items-center gap-3.5 cursor-pointer"
                              onClick={() => {
                                setIsCategoriesOpen(false);
                                router.push(`/shop?category=${encodeURIComponent(cat.name)}`);
                              }}
                            >
                              {/* Card Thumbnail: Fit image perfectly into rounded frame */}
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#1E293B]/10 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-xs group-hover/item:scale-105 transition-transform duration-300">
                                <img
                                  src={imgPath}
                                  alt={cat.name}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              </div>
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <h5 className="font-display font-extrabold text-xs sm:text-sm text-[#1E293B] group-hover/item:text-[#3674B5] transition-colors leading-tight truncate">
                                  {cat.name}
                                </h5>
                                <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider flex items-center gap-1 opacity-90 group-hover/item:opacity-100">
                                  <span>Browse</span>
                                  <span className="group-hover/item:translate-x-1 transition-transform">→</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer Trust Ribbon */}
                      <div className="mt-5 pt-3.5 border-t border-[#1E293B]/10 flex items-center justify-between text-[10px] font-bold text-[#1E293B]/60 px-1">
                        <span className="flex items-center gap-1.5"><span className="text-[#3674B5]">✓</span> 100% Genuine RAVTRON® Products</span>
                        <span className="flex items-center gap-1.5"><span className="text-[#3674B5]">⚡</span> Express Pan-India Delivery</span>
                        <span className="flex items-center gap-1.5"><span className="text-[#3674B5]">🛡️</span> Official Warranty Protection</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm transition-colors relative py-1 after:absolute after:bottom-0 after:h-[2px] after:bg-[#3674B5] after:transition-all ${active
                      ? "font-bold text-[#3674B5] after:w-full after:left-0"
                      : "font-semibold text-[#1E293B]/70 hover:text-[#1E293B] after:left-1/2 after:w-0 hover:after:w-full hover:after:left-0"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Icons & CTAs */}
          <div className="flex items-center gap-0.5 xs:gap-1.5 sm:gap-4 shrink-0">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1 sm:p-2 rounded-full hover:bg-[#3674B5]/5 text-[#1E293B]/70 hover:text-[#1E293B] transition-all hover:scale-105 active:scale-95"
              aria-label="Search Products"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className="p-1 sm:p-2 rounded-full hover:bg-[#3674B5]/5 text-[#1E293B]/70 hover:text-[#1E293B] transition-all relative hover:scale-105 active:scale-95 inline-flex"
              aria-label="Wishlist"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#3674B5] text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="p-1 sm:p-2 rounded-full hover:bg-[#3674B5]/5 text-[#1E293B]/70 hover:text-[#1E293B] transition-all relative hover:scale-105 active:scale-95 inline-flex"
              aria-label="Cart"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#3674B5] text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Login / Sign Up or Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1 rounded-full hover:bg-[#3674B5]/5 border border-[#1E293B]/5 transition-all text-[#1E293B] hover:scale-102"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-[#3674B5]/20"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#3674B5]/20 bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-display font-extrabold text-[10px] sm:text-xs uppercase">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-extrabold pr-2">{user.name ? user.name.split(" ")[0] : "User"}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#1E293B]/10 p-2.5 shadow-xl z-[999] animate-fade-in-up flex flex-col gap-1">
                    <div className="px-3 py-2 border-b border-[#1E293B]/5 mb-1.5 text-left">
                      <p className="text-[10px] font-bold text-[#1E293B]/40 uppercase tracking-wider">Account</p>
                      <p className="text-xs font-black text-[#1E293B] truncate">{user.name}</p>
                    </div>
                    {user.role === "Administrator" || user.email === "officerequirementsgurgaon@gmail.com" || user.email === "ravtron@admin.com" ? (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="px-3 py-2.5 rounded-xl hover:bg-[#3674B5]/5 text-xs font-extrabold text-[#1E293B]/70 hover:text-[#1E293B] transition-all flex items-center gap-2 text-left"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Admin Panel</span>
                      </Link>
                    ) : (
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="px-3 py-2.5 rounded-xl hover:bg-[#3674B5]/5 text-xs font-extrabold text-[#1E293B]/70 hover:text-[#1E293B] transition-all flex items-center gap-2 text-left"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="px-3 py-2.5 rounded-xl hover:bg-rose-50 text-xs font-extrabold text-rose-600 hover:text-rose-700 transition-all flex items-center gap-2 text-left w-full"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex px-5 py-2.5 rounded-full bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 text-center"
              >
                Login / Sign Up
              </Link>
            )}

            {/* Vertical Divider on Mobile */}
            <div className="md:hidden h-4.5 w-[1px] bg-[#1E293B]/10 mx-0.5" />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full hover:bg-[#3674B5]/5 text-[#1E293B]/70 hover:text-[#1E293B] shrink-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 mx-4 max-w-5xl rounded-3xl bg-[#FFFFFF] border border-[#1E293B]/10 p-4 flex flex-col gap-3 shadow-lg animate-fade-in-up">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${active
                      ? "bg-[#3674B5]/10 text-[#3674B5]"
                      : "hover:bg-[#3674B5]/5 text-[#1E293B]/80 hover:text-[#1E293B]"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {user ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#1E293B]/5 w-full">
                {user.role === "Administrator" || user.email === "officerequirementsgurgaon@gmail.com" || user.email === "ravtron@admin.com" ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl bg-[#3674B5]/5 hover:bg-[#3674B5]/10 text-[#3674B5] text-sm font-bold transition-all text-center block"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl bg-[#3674B5]/5 hover:bg-[#3674B5]/10 text-[#3674B5] text-sm font-bold transition-all text-center block"
                  >
                    My Profile Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold transition-all text-center"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#3674B5] text-white text-sm font-bold transition-all text-center"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
