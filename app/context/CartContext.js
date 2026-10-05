"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { products as fallbackProducts, categories as fallbackCategories } from "../data/products";

const CartContext = createContext(null);

// ── Module-level cache timestamps ─────────────────────────────────────────────
// These live outside the component so they persist across React re-renders and
// context remounts (e.g., Next.js App Router page navigations).
let _categoriesFetchedAt = 0;
let _productsFetchedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Global cache states for products, categories, and coupons to optimize page load speeds
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);

  const fetchCoupons = async (overrideEmail = null) => {
    try {
      let emailParam = overrideEmail;
      if (!emailParam) {
        try {
          const session = localStorage.getItem("ravtron_session");
          if (session) {
            const parsed = JSON.parse(session);
            if (parsed && parsed.email) emailParam = parsed.email;
          }
        } catch (e) {}
      }
      const url = emailParam ? `/api/coupons?email=${encodeURIComponent(emailParam)}` : "/api/coupons";
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCoupons(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch coupons in CartContext", err);
    } finally {
      setCouponsLoading(false);
    }
  };

  const fetchProducts = async (retries = 3, delay = 1000) => {
    if (products.length === 0) {
      setProductsLoading(true);
    }
    try {
      const res = await fetch("/api/products?excludeGallery=true", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map((p) => ({
          ...p,
          name: p.name ? p.name.replace(/ravtron/gi, "RAVTRON") : p.name,
          description: p.description ? p.description.replace(/ravtron/gi, "RAVTRON") : p.description
        }));
        setProducts(formatted);
        try {
          localStorage.setItem("powerhub_products_cache", JSON.stringify(formatted));
        } catch (e) {}
      }
      setProductsLoading(false);
    } catch (err) {
      console.error(`Failed to fetch products globally (retries left: ${retries})`, err);
      if (retries > 0) {
        setTimeout(() => fetchProducts(retries - 1, delay * 1.5), delay);
      } else {
        // Fallback to cached products if available, otherwise local static products
        try {
          const cached = localStorage.getItem("powerhub_products_cache");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(parsed);
              setProductsLoading(false);
              return;
            }
          }
        } catch (e) {}
        
        setProducts(fallbackProducts);
        setProductsLoading(false);
      }
    } finally {
      if (retries === 0) {
        setProductsLoading(false);
      }
    }
  };

  const fetchCategories = async (retries = 3, delay = 1000, force = false) => {
    // ── In-memory cache guard: skip fetch if data is fresh (< 5 min old) ────
    const now = Date.now();
    if (!force && _categoriesFetchedAt > 0 && now - _categoriesFetchedAt < CACHE_TTL_MS) {
      return; // Already fetched recently — skip the network call
    }

    if (categories.length === 0) {
      setCategoriesLoading(true);
    }
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        _categoriesFetchedAt = Date.now(); // Mark successful fetch time
        try {
          localStorage.setItem("powerhub_categories_cache", JSON.stringify(data));
        } catch (e) {}
      }
      setCategoriesLoading(false);
    } catch (err) {
      console.error(`Failed to fetch categories globally (retries left: ${retries})`, err);
      if (retries > 0) {
        setTimeout(() => fetchCategories(retries - 1, delay * 1.5, force), delay);
      } else {
        // Fallback to cached categories if available, otherwise local static categories
        try {
          const cached = localStorage.getItem("powerhub_categories_cache");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCategories(parsed);
              setCategoriesLoading(false);
              return;
            }
          }
        } catch (e) {}

        setCategories(fallbackCategories);
        setCategoriesLoading(false);
      }
    } finally {
      if (retries === 0) {
        setCategoriesLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCoupons();
  }, []);

  const refreshProducts = () => {
    try {
      localStorage.removeItem("powerhub_products_cache");
    } catch (e) {}
    fetchProducts();
  };
  const refreshCategories = () => {
    try {
      localStorage.removeItem("powerhub_categories_cache");
    } catch (e) {}
    _categoriesFetchedAt = 0; // Bust the in-memory cache so a fresh fetch is forced
    fetchCategories(3, 1000, true);
    try {
      window.dispatchEvent(new Event("ravtron_categories_change"));
    } catch (e) {}
  };
  const refreshCoupons = () => fetchCoupons();

  const isInitialized = React.useRef(false);

  const getUserCartKey = (prefix = "ravtron_cart") => {
    try {
      const session = localStorage.getItem("ravtron_session");
      if (session) {
        const parsed = JSON.parse(session);
        const identifier = parsed.email || parsed.id || parsed._id;
        if (identifier) {
          return `${prefix}_${identifier.toString().toLowerCase()}`;
        }
      }
    } catch (e) {}
    return prefix;
  };

  // Load initial cart and wishlist from localStorage on client mount
  useEffect(() => {
    // Load products and categories cache safely on client mount
    try {
      const cachedProds = localStorage.getItem("powerhub_products_cache");
      if (cachedProds) {
        const parsed = JSON.parse(cachedProds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setProductsLoading(false);
        }
      }

      const cachedCats = localStorage.getItem("powerhub_categories_cache");
      if (cachedCats) {
        const parsed = JSON.parse(cachedCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          setCategoriesLoading(false);
        }
      }
    } catch (e) {
      console.warn("Failed to load products/categories cache on mount", e);
    }

    // Global theme initialization (Default & permanent Light Mode)
    document.documentElement.classList.add("light-mode");
    try {
      localStorage.removeItem("ravtron_theme");
    } catch (e) {}

    const session = localStorage.getItem("ravtron_session");
    if (session) {
      const userCartKey = getUserCartKey("ravtron_cart");
      const userWishlistKey = getUserCartKey("ravtron_wishlist");
      const savedCart = localStorage.getItem(userCartKey) || localStorage.getItem("ravtron_cart");
      const savedWishlist = localStorage.getItem(userWishlistKey) || localStorage.getItem("ravtron_wishlist");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      }
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {
          console.error("Failed to parse wishlist from localStorage", e);
        }
      }
    } else {
      setCart([]);
      setWishlist([]);
    }
    isInitialized.current = true;

    // Listen for auth change (login / logout) to restore or clear cart & wishlist
    const handleAuthChange = () => {
      const currentSession = localStorage.getItem("ravtron_session");
      if (currentSession) {
        try {
          const currentCartKey = getUserCartKey("ravtron_cart");
          const currentWishlistKey = getUserCartKey("ravtron_wishlist");
          const userCartData = localStorage.getItem(currentCartKey) || localStorage.getItem("ravtron_cart");
          const userWishlistData = localStorage.getItem(currentWishlistKey) || localStorage.getItem("ravtron_wishlist");

          if (userCartData) {
            setCart(JSON.parse(userCartData));
          }
          if (userWishlistData) {
            setWishlist(JSON.parse(userWishlistData));
          }
          fetchCoupons();
        } catch (e) {
          console.error("Failed to restore user cart on login", e);
        }
      } else {
        setCart([]);
        setWishlist([]);
        setDiscount(0);
        setCoupon("");
        fetchCoupons();
      }
    };

    const handleCategoryChange = () => {
      try {
        localStorage.removeItem("powerhub_categories_cache");
      } catch (e) {}
      fetchCategories();
    };

    window.addEventListener("ravtron_auth_change", handleAuthChange);
    window.addEventListener("ravtron_categories_change", handleCategoryChange);
    window.addEventListener("storage", handleCategoryChange);
    return () => {
      window.removeEventListener("ravtron_auth_change", handleAuthChange);
      window.removeEventListener("ravtron_categories_change", handleCategoryChange);
      window.removeEventListener("storage", handleCategoryChange);
    };
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (isInitialized.current) {
      const currentSession = localStorage.getItem("ravtron_session");
      if (currentSession) {
        const key = getUserCartKey("ravtron_cart");
        localStorage.setItem(key, JSON.stringify(cart));
        localStorage.setItem("ravtron_cart", JSON.stringify(cart));
      }
    }
  }, [cart]);

  // Save wishlist to localStorage on changes
  useEffect(() => {
    if (isInitialized.current) {
      const currentSession = localStorage.getItem("ravtron_session");
      if (currentSession) {
        const key = getUserCartKey("ravtron_wishlist");
        localStorage.setItem(key, JSON.stringify(wishlist));
        localStorage.setItem("ravtron_wishlist", JSON.stringify(wishlist));
      }
    }
  }, [wishlist]);

  // Toast notification helper
  const showToast = (message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  // Auth validation helper
  const checkIsLoggedIn = () => {
    try {
      const session = localStorage.getItem("ravtron_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && (parsed.email || parsed.id || parsed._id)) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  };

  const addToCart = (product, quantityToAdd = 1) => {
    if (!checkIsLoggedIn()) {
      showToast("Please log in to add items to your cart", "error");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
      return;
    }

    // Resolve latest stock from products array if available
    const matchedProduct = products.find(p => String(p.id) === String(product.id) || String(p._id) === String(product.id)) || product;
    const availableStock = matchedProduct.stock !== undefined ? matchedProduct.stock : (product.stock !== undefined ? product.stock : 999);

    if (typeof availableStock === "number" && availableStock <= 0) {
      showToast(`Sorry, "${product.name}" is currently out of stock.`, "error");
      return;
    }

    const variantTag = product.selectedSize || product.selectedPrivacySize || product.selectedChannel;

    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === product.selectedSize &&
          item.selectedPrivacySize === product.selectedPrivacySize &&
          item.selectedChannel === product.selectedChannel
      );

      const currentQtyInCart = existing ? existing.quantity : 0;
      const targetQty = currentQtyInCart + quantityToAdd;

      if (typeof availableStock === "number" && targetQty > availableStock) {
        showToast(availableStock <= 0
          ? `Sorry, "${product.name}" is currently out of stock.`
          : `Sorry, only ${availableStock} unit(s) of "${product.name}" are available in stock.`, "error");
        return prevCart;
      }

      if (existing) {
        showToast(`Added ${quantityToAdd}x ${product.name}${variantTag ? ` (${variantTag})` : ""} to cart`);
        return prevCart.map((item) =>
          item.id === product.id &&
          item.selectedSize === product.selectedSize &&
          item.selectedPrivacySize === product.selectedPrivacySize &&
          item.selectedChannel === product.selectedChannel
            ? { ...item, quantity: item.quantity + quantityToAdd, stock: availableStock }
            : item
        );
      }
      showToast(`Added ${quantityToAdd}x ${product.name}${variantTag ? ` (${variantTag})` : ""} to cart`);
      return [...prevCart, { ...product, quantity: quantityToAdd, stock: availableStock }];
    });
  };

  const removeFromCart = (target, selectedSize = null, selectedChannel = null) => {
    setCart((prevCart) => {
      let itemToRemove = null;

      if (typeof target === "object" && target !== null) {
        itemToRemove = target;
      } else {
        itemToRemove = prevCart.find(
          (i) =>
            (String(i.id) === String(target) || String(i._id) === String(target)) &&
            (i.selectedSize || null) === (selectedSize || null) &&
            (i.selectedChannel || null) === (selectedChannel || null)
        );
      }

      if (itemToRemove) {
        const variantTag = itemToRemove.selectedSize || itemToRemove.selectedPrivacySize || itemToRemove.selectedChannel;
        showToast(`Removed ${itemToRemove.name}${variantTag ? ` (${variantTag})` : ""} from cart`, "info");
      }

      return prevCart.filter((i) => {
        let isMatch = false;
        if (typeof target === "object" && target !== null) {
          const targetId = target.id || target._id;
          const itemId = i.id || i._id;
          const matchesId = i === target || (targetId && String(itemId) === String(targetId));
          const matchesSize = !selectedSize || (i.selectedSize || null) === selectedSize;
          const matchesChannel = !selectedChannel || (i.selectedChannel || null) === selectedChannel;
          isMatch = matchesId && matchesSize && matchesChannel;
        } else {
          const targetIdStr = String(target);
          const matchesId = String(i.id) === targetIdStr || String(i._id) === targetIdStr;
          const matchesSize = !selectedSize || (i.selectedSize || null) === selectedSize;
          const matchesChannel = !selectedChannel || (i.selectedChannel || null) === selectedChannel;
          isMatch = matchesId && matchesSize && matchesChannel;
        }
        return !isMatch;
      });
    });
  };

  const updateQuantity = (target, amount, selectedSize = null, selectedChannel = null) => {
    if (!checkIsLoggedIn()) {
      showToast("Please log in to manage your cart", "error");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
      return;
    }

    setCart((prevCart) =>
      prevCart
        .map((item) => {
          let isMatch = false;
          if (typeof target === "object" && target !== null) {
            const targetId = target.id || target._id;
            const itemId = item.id || item._id;
            const matchesId = item === target || (targetId && String(itemId) === String(targetId));
            const matchesSize = !selectedSize || (item.selectedSize || null) === selectedSize;
            const matchesChannel = !selectedChannel || (item.selectedChannel || null) === selectedChannel;
            isMatch = matchesId && matchesSize && matchesChannel;
          } else {
            const targetIdStr = String(target);
            const matchesId = String(item.id) === targetIdStr || String(item._id) === targetIdStr;
            const matchesSize = !selectedSize || (item.selectedSize || null) === selectedSize;
            const matchesChannel = !selectedChannel || (item.selectedChannel || null) === selectedChannel;
            isMatch = matchesId && matchesSize && matchesChannel;
          }

          if (isMatch) {
            const nextQty = item.quantity + amount;
            if (amount > 0) {
              const matchedProduct = products.find(p => String(p.id) === String(item.id) || String(p._id) === String(item.id)) || item;
              const availableStock = matchedProduct.stock !== undefined ? matchedProduct.stock : item.stock;
              if (typeof availableStock === "number" && nextQty > availableStock) {
                showToast(availableStock <= 0
                  ? `Sorry, "${item.name}" is currently out of stock.`
                  : `Sorry, only ${availableStock} unit(s) of "${item.name}" are available in stock.`, "error");
                return item;
              }
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleWishlist = (product) => {
    if (!checkIsLoggedIn()) {
      showToast("Please log in to save items to your wishlist", "error");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
      return;
    }

    setWishlist((prevWishlist) => {
      const exists = prevWishlist.find((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed ${product.name} from wishlist`, "info");
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        showToast(`Added ${product.name} to wishlist`);
        return [...prevWishlist, product];
      }
    });
  };

  const applyCouponCode = (codeToApply) => {
    if (!codeToApply || typeof codeToApply !== "string") {
      showToast("Please enter a valid coupon code", "error");
      return false;
    }

    const cleanCode = codeToApply.trim().toUpperCase();
    const foundCoupon = coupons.find((c) => c.code === cleanCode && c.active);

    if (!foundCoupon) {
      showToast(`Coupon code '${cleanCode}' is invalid or inactive`, "error");
      return false;
    }

    // Check expiration date
    if (foundCoupon.expiryDate) {
      const today = new Date();
      const expiry = new Date(foundCoupon.expiryDate);
      expiry.setHours(23, 59, 59, 999);
      if (today > expiry) {
        showToast(`Coupon code '${cleanCode}' expired on ${foundCoupon.expiryDate}`, "error");
        return false;
      }
    }

    const subtotal = getSubtotal();
    if (foundCoupon.minPurchase > 0 && subtotal < foundCoupon.minPurchase) {
      showToast(`Minimum order amount of ₹${foundCoupon.minPurchase} required for '${cleanCode}'`, "error");
      return false;
    }

    // Product-level restriction check
    if (foundCoupon.applicableProductId) {
      const targetItem = cart.find(
        (item) =>
          String(item.id) === String(foundCoupon.applicableProductId) ||
          String(item._id) === String(foundCoupon.applicableProductId)
      );

      if (!targetItem) {
        showToast(
          `Coupon '${cleanCode}' is valid only for '${foundCoupon.applicableProductName || "a specific product"}'. Please add it to your bag!`,
          "error"
        );
        return false;
      }

      const itemSubtotal = targetItem.price * targetItem.quantity;
      let calculatedDiscount = 0;
      if (foundCoupon.type === "percentage") {
        calculatedDiscount = Math.round((itemSubtotal * foundCoupon.discountValue) / 100);
      } else {
        calculatedDiscount = Math.min(itemSubtotal, foundCoupon.discountValue);
      }

      setCoupon(cleanCode);
      setDiscount(calculatedDiscount);
      showToast(`Coupon '${cleanCode}' applied for ${targetItem.name}! Saved ₹${calculatedDiscount}`);
      return true;
    }

    // Category-level restriction check
    if (foundCoupon.applicableCategory && foundCoupon.applicableCategory !== "All") {
      const categoryItems = cart.filter(
        (item) => item.category && item.category.toLowerCase() === foundCoupon.applicableCategory.toLowerCase()
      );

      if (categoryItems.length === 0) {
        showToast(`Coupon '${cleanCode}' is valid only for '${foundCoupon.applicableCategory}' products`, "error");
        return false;
      }

      const categorySubtotal = categoryItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      let calculatedDiscount = 0;
      if (foundCoupon.type === "percentage") {
        calculatedDiscount = Math.round((categorySubtotal * foundCoupon.discountValue) / 100);
      } else {
        calculatedDiscount = Math.min(categorySubtotal, foundCoupon.discountValue);
      }

      setCoupon(cleanCode);
      setDiscount(calculatedDiscount);
      showToast(`Coupon '${cleanCode}' applied for ${foundCoupon.applicableCategory}! Saved ₹${calculatedDiscount}`);
      return true;
    }

    // General store-wide discount
    let calculatedDiscount = 0;
    if (foundCoupon.type === "percentage") {
      calculatedDiscount = Math.round((subtotal * foundCoupon.discountValue) / 100);
    } else {
      calculatedDiscount = Math.min(subtotal, foundCoupon.discountValue);
    }

    setCoupon(cleanCode);
    setDiscount(calculatedDiscount);
    showToast(`Coupon '${cleanCode}' applied successfully! Saved ₹${calculatedDiscount}`);
    return true;
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCoupon("");
    showToast("Coupon code removed");
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCoupon("");
    try {
      localStorage.removeItem("ravtron_cart");
    } catch (e) {}
  };

  const clearWishlist = () => {
    setWishlist([]);
    try {
      localStorage.removeItem("ravtron_wishlist");
    } catch (e) {}
  };

  const clearCartAndWishlist = () => {
    clearCart();
    clearWishlist();
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isVideoOpen,
        setIsVideoOpen,
        activeProduct,
        setActiveProduct,
        coupon,
        discount,
        toasts,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        applyCouponCode,
        removeCoupon,
        clearCart,
        clearWishlist,
        clearCartAndWishlist,
        getSubtotal,
        getCartCount,
        showToast,
        products,
        productsLoading,
        categories,
        categoriesLoading,
        coupons,
        couponsLoading,
        refreshProducts,
        refreshCategories,
        refreshCoupons,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-5 py-4 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3 animate-fade-in-up ${toast.type === "success"
              ? "bg-[#3674B5] text-white border-[#3674B5]/40"
              : toast.type === "error"
                ? "bg-[#3674B5] text-white border-[#3674B5]/40"
                : "bg-[#EDECE6] text-[#1E293B] border-[#1E293B]/15"
              }`}
          >
            {toast.type === "success" && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === "error" && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === "info" && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
