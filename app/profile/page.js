"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import Image from "next/image";
import {
  User,
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  Edit3,
  Check,
  Package,
  Truck,
  Calendar,
  ShieldAlert,
  CreditCard,
  Bell,
  Heart,
  Home,
  X,
  ChevronRight,
  Search,
  ArrowRight
} from "lucide-react";
import SearchModal from "../../components/SearchModal";
import CartDrawer from "../../components/CartDrawer";

export default function ProfilePage() {
  const router = useRouter();
  const { wishlist, getCartCount, toggleWishlist, addToCart, showToast, clearCartAndWishlist } = useCart();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, orders, wishlist, addresses, settings

  // Settings form states
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Address states
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: ""
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: ""
  });
  const [isFetchingPin, setIsFetchingPin] = useState(false);

  const handleProfilePinLookup = async (pincodeVal) => {
    const cleanPin = pincodeVal.replace(/\D/g, "");
    if (cleanPin.length === 6) {
      setIsFetchingPin(true);
      try {
        const res = await fetch(`/api/pincode/${cleanPin}`);
        const data = await res.json();
        if (data.success && (data.city || data.state)) {
          const detectedCity = data.city || "";
          const detectedState = data.state || "";

          setTempAddress((prev) => ({
            ...prev,
            city: detectedCity,
            state: detectedState
          }));
          showToast(`Location detected: ${detectedCity}, ${detectedState}`);
        }
      } catch (e) {
        console.error("PIN code lookup error", e);
      } finally {
        setIsFetchingPin(false);
      }
    }
  };

  // Dynamic Orders State
  const [orders, setOrders] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.isLoggedIn || !data.user) {
          const session = localStorage.getItem("ravtron_session");
          if (session) {
            const parsed = JSON.parse(session);
            setUser(parsed);
            setProfileName(parsed.name || "");
            setProfileEmail(parsed.email || "");
            setProfilePhone(parsed.phone || "");
            setProfileDob(parsed.dob || "");
            setProfileGender(parsed.gender || "");
            fetchOrders(parsed.email);
          } else {
            router.push("/login");
          }
        } else {
          const parsed = data.user;
          setUser(parsed);
          setProfileName(parsed.name || "");
          setProfileEmail(parsed.email || "");
          setProfilePhone(parsed.phone || "");
          setProfileDob(parsed.dob || "");
          setProfileGender(parsed.gender || "");
          localStorage.setItem("ravtron_session", JSON.stringify(parsed));
          fetchOrders(parsed.email);
        }
      } catch (e) {
        console.error("Failed to fetch session:", e);
      }
    };

    const fetchOrders = (userEmail) => {
      if (!userEmail) return;
      fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`)
        .then((res) => res.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch((e) => {
          console.error("Failed to fetch orders from database", e);
          setOrders([]);
        });
    };

    // Load shipping address from localStorage
    const savedAddress = localStorage.getItem("ravtron_address");
    if (savedAddress) {
      try {
        const parsedAddress = JSON.parse(savedAddress);
        setShippingAddress(parsedAddress);
        setTempAddress(parsedAddress);
      } catch (e) {
        console.error("Failed to parse address data", e);
      }
    }

    fetchUserProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update user name in MongoDB database
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: user.email,
          name: profileName
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update profile in database");
      }

      // 2. Update local storage session
      const updatedUser = {
        ...user,
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        dob: profileDob,
        gender: profileGender
      };
      localStorage.setItem("ravtron_session", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsSaving(false);
      setSaveSuccess(true);
      window.dispatchEvent(new Event("ravtron_auth_change"));
      showToast("Profile details updated successfully.");

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving profile details:", err);
      showToast(err.message || "Failed to save profile details.", "error");
      setIsSaving(false);
    }
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setShippingAddress(tempAddress);
    localStorage.setItem("ravtron_address", JSON.stringify(tempAddress));
    setIsEditingAddress(false);
    showToast("Address settings saved.");
  };

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
    window.dispatchEvent(new Event("ravtron_auth_change"));
    showToast("Logged out successfully.");
    router.push("/");
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to cancel order");
      }
      const updatedOrder = await response.json();
      showToast("Order cancelled successfully.");

      setOrders(prev =>
        prev.map(o => (o.id === orderId ? {
          ...o,
          status: "Cancelled",
          statusColor: "text-rose-500 bg-rose-50",
          trackingSteps: updatedOrder.trackingSteps
        } : o))
      );
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to cancel order.", "error");
    }
  };

  const isOrderCancellable = (order) => {
    if (!order || order.status === "Cancelled") return false;
    const orderCreatedAt = order.createdAt ? new Date(order.createdAt).getTime() : new Date(order.date).getTime();
    if (isNaN(orderCreatedAt)) return true;
    const hoursElapsed = (Date.now() - orderCreatedAt) / (1000 * 60 * 60);
    return hoursElapsed <= 24;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Loading Profile Dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-[#1E293B] antialiased font-sans">

      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r border-slate-100 flex flex-col justify-between p-6 bg-white shrink-0 h-full">
        <div className="space-y-8">

          {/* User Profile Header */}
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-full bg-[#3674B5]/10 text-[#3674B5] flex items-center justify-center font-display font-black text-sm uppercase border border-[#3674B5]/20">
              {user.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">{user.role}</p>
            </div>
          </div>

          <div className="px-3 border-t border-slate-100 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROFILE MENU</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "overview"
                  ? "bg-slate-50 text-slate-900 font-bold"
                  : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "orders"
                  ? "bg-slate-50 text-slate-900 font-bold"
                  : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span>Order History</span>
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "wishlist"
                  ? "bg-slate-50 text-slate-900 font-bold"
                  : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <Heart className="w-4 h-4 text-slate-400" />
              <span>Wishlist</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "addresses"
                  ? "bg-slate-50 text-slate-900 font-bold"
                  : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "settings"
                  ? "bg-slate-50 text-slate-900 font-bold"
                  : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar bottom actions */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          {user.role === "Administrator" && (
            <button
              onClick={() => router.push("/admin")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#3674B5] bg-[#3674B5]/5 hover:bg-[#3674B5]/10 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Go to Shop</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-grow p-8 md:p-12 bg-slate-50/50 h-full overflow-y-auto">

        {/* HEADER AREA */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">
              {activeTab === "overview" && "Profile Overview"}
              {activeTab === "orders" && "Order History"}
              {activeTab === "wishlist" && "Saved Wishlist"}
              {activeTab === "addresses" && "Manage Addresses"}
              {activeTab === "settings" && "Account Settings"}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {activeTab === "overview" && "Manage your corporate email, settings, and workspace preferences."}
              {activeTab === "orders" && "Review tracking status, totals, and invoices for past checkouts."}
              {activeTab === "wishlist" && "Products you've saved to buy later. Click Add to Bag to checkout."}
              {activeTab === "addresses" && "Configure default shipping coordinates for checkout dispatches."}
              {activeTab === "settings" && "Modify contact numbers, notification alerts, and profile details."}
            </p>
          </div>
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">{orders.length}</h3>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved Wishlist</p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">{wishlist.length} items</h3>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Savings</p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  ₹{orders.reduce((acc, curr) => acc + (curr.savings || 0), 0).toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Profile Fields Details */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Full Name</span>
                    <span className="font-bold text-slate-900">{user.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Email Address</span>
                    <span className="font-bold text-slate-900">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Mobile Phone</span>
                    <span className="font-bold text-slate-900">{user.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Date of Birth</span>
                    <span className="font-bold text-slate-900">{user.dob || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Gender</span>
                    <span className="font-bold text-slate-900 capitalize">{user.gender || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Account Status</span>
                    <span className="font-bold text-emerald-600">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note alert box */}
            {orders.length > 0 && (
              <div className="bg-[#3674B5]/5 border border-[#3674B5]/10 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                <Package className="w-5 h-5 text-[#3674B5] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-955">Recent Order Tracker</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    Your recent package <strong>{orders[0].id}</strong> is currently in state <strong>{orders[0].status}</strong>. Click Track Order inside the history list for tracking info.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ORDERS HISTORY */}
        {activeTab === "orders" && (
          <div className="space-y-8 animate-fade-in">
            {orders.length > 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-slate-800">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[9px] tracking-wider text-slate-400 font-black">
                        <th className="p-4 w-12 text-center">SNo</th>
                        <th className="p-4">Order Reference</th>
                        <th className="p-4">Date Placed</th>
                        <th className="p-4">Package Contents</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, idx) => (
                        <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                          <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-4 font-bold text-slate-900 tracking-tight">{order.id}</td>
                          <td className="p-4 text-slate-500">{order.date}</td>
                          <td className="p-4 font-medium text-slate-600">
                            <div className="space-y-1">
                              {order.items.map((item, idy) => (
                                <p key={idy} className="text-[10px]">
                                  {item.name} <span className="font-bold text-slate-400">x{item.qty}</span>
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-900">₹{order.total.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${order.statusColor}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center flex-wrap items-center">
                              <button
                                onClick={() => setTrackingOrder(order)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold uppercase transition-all whitespace-nowrap"
                              >
                                Track Package
                              </button>

                              {isOrderCancellable(order) && (
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-600 text-[10px] font-bold uppercase transition-all cursor-pointer"
                                  title="Cancel order (allowed within 24 hours of ordering)"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">You haven't placed any orders yet</h4>
                  <p className="text-xs text-slate-400 font-semibold">Your checkouts will display here once you order RAVTRON products.</p>
                </div>
                <button
                  onClick={() => router.push("/shop")}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: WISHLIST */}
        {activeTab === "wishlist" && (
          <div className="space-y-8 animate-fade-in">
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlist.map((product) => (
                  <div
                    key={product.id}
                    className="group relative rounded-xl border border-slate-100 p-2.5 flex flex-col justify-between hover:border-[#3674B5]/30 bg-white transition-all shadow-3xs w-full max-w-[280px] mx-auto"
                  >
                    <div>
                      <div
                        className="relative aspect-square w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-2.5 cursor-pointer flex items-center justify-center"
                        onClick={() => router.push(`/product/${product.id}`)}
                      >
                        <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 150px, (max-width: 768px) 250px, 300px" className="object-cover" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{product.category}</span>
                      <h4
                        className="font-bold text-[11px] sm:text-xs text-slate-900 group-hover:text-[#3674B5] transition-colors line-clamp-1 cursor-pointer mb-2"
                        onClick={() => router.push(`/product/${product.id}`)}
                      >
                        {product.name}
                      </h4>
                      <p className="font-bold text-slate-900 text-xs mb-3">₹{product.price.toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2 pt-2.5 border-t border-slate-100 mt-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-grow py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white text-[9px] sm:text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1"
                      >
                        <span>Add</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="px-2 py-1.5 rounded-lg border border-rose-100 bg-rose-50/30 hover:bg-rose-50 text-rose-600 text-[9px] sm:text-[10px] font-bold uppercase transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Your wishlist is currently empty</h4>
                  <p className="text-xs text-slate-400 font-semibold">Explore our premium dynamic electronic accessories to save your favorites.</p>
                </div>
                <button
                  onClick={() => router.push("/shop")}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Explore Shop
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: ADDRESSES */}
        {activeTab === "addresses" && (
          <div className="space-y-8 animate-fade-in">
            {!isEditingAddress ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Shipping Card */}
                <div className="rounded-2xl border border-slate-100 p-5 space-y-4 bg-white flex flex-col justify-between shadow-3xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#3674B5]">
                      <Truck className="w-4 h-4 shrink-0" />
                      <h4 className="text-[10px] font-bold uppercase tracking-wider">Default Shipping Address</h4>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 space-y-0.5 pt-1.5 leading-relaxed">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      {shippingAddress.street ? (
                        <>
                          <p>{shippingAddress.street}</p>
                          <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zip}</p>
                          <p>{shippingAddress.country}</p>
                        </>
                      ) : (
                        <p className="text-slate-400 italic font-medium">No default shipping address configured.</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTempAddress({ ...shippingAddress });
                      setIsEditingAddress(true);
                    }}
                    className="w-full mt-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Location Address</span>
                  </button>
                </div>

                {/* Billing Card */}
                <div className="rounded-2xl border border-slate-100 p-5 space-y-4 bg-white flex flex-col justify-between shadow-3xs opacity-80">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-500">
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <h4 className="text-[10px] font-bold uppercase tracking-wider">Default Billing Address</h4>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 space-y-0.5 pt-1.5 leading-relaxed">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      {shippingAddress.street ? (
                        <>
                          <p>{shippingAddress.street}</p>
                          <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zip}</p>
                          <p>{shippingAddress.country}</p>
                        </>
                      ) : (
                        <p className="text-slate-400 italic font-medium">No billing default set.</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => alert("Billing details are synchronized with default shipping details.")}
                    className="w-full mt-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-400 transition-all text-center cursor-default"
                  >
                    Same as Shipping Defaults
                  </button>
                </div>

              </div>
            ) : (
              // Edit Address Form
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm max-w-lg">
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-50 pb-3">Update Shipping Coordinates</h3>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                      value={tempAddress.street}
                      onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                        value={tempAddress.city}
                        onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                        value={tempAddress.state}
                        onChange={(e) => setTempAddress({ ...tempAddress, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIN / ZIP Code</label>
                        {isFetchingPin && <span className="text-[9px] font-bold text-[#3674B5] animate-pulse">Detecting...</span>}
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        placeholder="6-digit PIN"
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                        value={tempAddress.zip}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setTempAddress({ ...tempAddress, zip: val });
                          handleProfilePinLookup(val);
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Country</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                        value={tempAddress.country}
                        onChange={(e) => setTempAddress({ ...tempAddress, country: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-fade-in">
            {/* Form settings */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm max-w-lg space-y-6">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-50 pb-3">Update Personal Credentials</h3>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    placeholder="Enter 10-digit phone number"
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                      value={profileDob}
                      onChange={(e) => setProfileDob(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                    <select
                      className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white"
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value)}
                      disabled={isSaving}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Details"}
                </button>
              </form>
            </div>

            {/* Notification configuration cards */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm max-w-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <Bell className="w-5 h-5 text-slate-500" />
                <h3 className="font-bold text-sm text-slate-900">Notification Channels</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-200 text-slate-900 mt-0.5" />
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">
                    <strong className="text-slate-800 block">Product Announcements</strong>
                    Weekly email newsletters detailing newly launched docking stations and adapters.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-200 text-slate-900 mt-0.5" />
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">
                    <strong className="text-slate-800 block">Order Status Updates</strong>
                    Real-time SMS and email alerts containing shipment tracking updates.
                  </span>
                </label>
              </div>
            </div>

            {/* Deletion Caution Card */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-6 md:p-8 shadow-sm max-w-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-rose-100/30 pb-3">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-rose-800">Danger Area</h3>
              </div>
              <p className="text-xs text-rose-700/60 font-semibold leading-relaxed">
                Simulating account deletion will clear your session and redirect you back to the home route.
              </p>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to simulate deletion?")) {
                    handleSignOut();
                  }
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Package tracking stepping overlay modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/30 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-100 p-6 md:p-8 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setTrackingOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Package Tracking</h3>
                <p className="text-[10px] text-[#3674B5] font-bold uppercase tracking-wider mt-0.5">Order Reference: {trackingOrder.id}</p>
              </div>

              {/* Timeline steps vertical layout */}
              <div className="space-y-5 pt-2">
                {trackingOrder.trackingSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx < trackingOrder.trackingSteps.length - 1 && (
                      <div className={`absolute top-6 left-3.5 -bottom-5 w-[2px] ${step.done ? "bg-emerald-500" : "bg-slate-100"}`} />
                    )}

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${step.done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-50 text-slate-400 border border-slate-100"
                      }`}>
                      {step.done ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    </div>

                    <div className="space-y-0.5 text-xs font-semibold">
                      <h4 className={`font-bold ${step.done ? "text-slate-900" : "text-slate-400"}`}>{step.title}</h4>
                      <p className="text-[10px] text-slate-450 font-semibold">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setTrackingOrder(null)}
                className="w-full mt-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all"
              >
                Close Info
              </button>
            </div>
          </div>
        </div>
      )}



      <SearchModal />
    </div>
  );
}
