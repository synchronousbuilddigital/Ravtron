"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import {
  BarChart2,
  ShoppingBag,
  Users,
  Package,
  Plus,
  Trash2,
  Edit3,
  Check,
  Lock,
  Unlock,
  FolderPlus,
  RefreshCw,
  X,
  ArrowRight,
  LogOut,
  Home,
  Search,
  ArrowLeft,
  ChevronRight,
  Cable,
  Zap,
  Briefcase,
  Camera,
  Laptop,
  Tv,
  Network,
  Eye,
  Tag,
  Gift,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Activity,
  CheckCircle2
} from "lucide-react";
import SearchModal from "../../components/SearchModal";
import CartDrawer from "../../components/CartDrawer";

const getCategoryIconDetails = (categoryName) => {
  const iconClass = "w-4 h-4";
  switch (categoryName) {
    case "Cables":
    case "HDMI Cables":
    case "VGA Cables":
      return {
        icon: <Cable className={iconClass} />,
        bg: "bg-blue-50 text-[#3674B5] border-blue-100"
      };
    case "Power Cords":
      return {
        icon: <Cable className={iconClass} />,
        bg: "bg-cyan-50 text-cyan-600 border-cyan-100"
      };
    case "Converters":
      return {
        icon: <Zap className={iconClass} />,
        bg: "bg-amber-50 text-amber-600 border-amber-100"
      };
    case "Accessories":
      return {
        icon: <Briefcase className={iconClass} />,
        bg: "bg-slate-50 text-slate-600 border-slate-100"
      };
    case "Surveillance":
      return {
        icon: <Camera className={iconClass} />,
        bg: "bg-rose-50 text-rose-600 border-rose-100"
      };
    case "Docking Stations":
      return {
        icon: <Laptop className={iconClass} />,
        bg: "bg-indigo-50 text-indigo-600 border-indigo-100"
      };
    case "Audio Video":
      return {
        icon: <Tv className={iconClass} />,
        bg: "bg-violet-50 text-violet-600 border-violet-100"
      };
    case "Networking":
      return {
        icon: <Network className={iconClass} />,
        bg: "bg-emerald-50 text-emerald-600 border-emerald-100"
      };
    default:
      return {
        icon: <Package className={iconClass} />,
        bg: "bg-slate-50 text-slate-500 border-slate-150"
      };
  }
};

export default function AdminPanelPage() {
  const router = useRouter();
  const {
    showToast,
    refreshProducts,
    refreshCategories,
    products: cartProducts,
    categories: cartCategories,
    coupons: globalCoupons,
    couponsLoading,
    refreshCoupons
  } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, products, orders, users, categories, hero, coupons

  const handleQuickRestock = async (productId, currentStock, restockQty = 10) => {
    const newStock = Number(currentStock || 0) + Number(restockQty);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock })
      });
      if (response.ok) {
        showToast(`Restocked +${restockQty} units successfully! New Stock: ${newStock}`);
        await fetchAdminData();
      } else {
        const errData = await response.json();
        showToast(errData.error || "Failed to update stock", "error");
      }
    } catch (err) {
      console.error("Restock error:", err);
      showToast("Error updating stock", "error");
    }
  };

  // Coupon States & Handlers
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    title: "",
    description: "",
    type: "percentage",
    discountValue: "",
    minPurchase: 0,
    applicableCategory: "All",
    badgeType: "Festive Offer",
    expiryDate: "",
    oneTimePerUser: true,
    active: true
  });

  const openCouponModal = (couponToEdit = null) => {
    if (couponToEdit) {
      setEditingCoupon(couponToEdit);
      setCouponForm({
        id: couponToEdit._id || couponToEdit.id,
        code: couponToEdit.code || "",
        title: couponToEdit.title || "",
        description: couponToEdit.description || "",
        type: couponToEdit.type || "percentage",
        discountValue: couponToEdit.discountValue || "",
        minPurchase: couponToEdit.minPurchase || 0,
        applicableCategory: couponToEdit.applicableCategory || "All",
        applicableProductId: couponToEdit.applicableProductId || "",
        applicableProductName: couponToEdit.applicableProductName || "",
        badgeType: couponToEdit.badgeType || "Festive Offer",
        expiryDate: couponToEdit.expiryDate || "",
        oneTimePerUser: couponToEdit.oneTimePerUser !== undefined ? couponToEdit.oneTimePerUser : true,
        active: couponToEdit.active !== undefined ? couponToEdit.active : true
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({
        code: "",
        title: "",
        description: "",
        type: "percentage",
        discountValue: "",
        minPurchase: 0,
        applicableCategory: "All",
        applicableProductId: "",
        applicableProductName: "",
        badgeType: "Festive Offer",
        expiryDate: "",
        oneTimePerUser: true,
        active: true
      });
    }
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.title || couponForm.discountValue === undefined || couponForm.discountValue === "") {
      showToast("Coupon Code, Title, and Discount Value are required.", "error");
      return;
    }

    setIsSavingCoupon(true);
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(couponForm)
      });
      if (response.ok) {
        await refreshCoupons();
        setIsCouponModalOpen(false);
        showToast(editingCoupon ? "Coupon updated successfully!" : "New Coupon created successfully!");
      } else {
        const errData = await response.json();
        showToast(errData.error || "Failed to save coupon", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving coupon", "error");
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId, couponCode) => {
    if (!confirm(`Are you sure you want to delete coupon '${couponCode}'?`)) return;
    try {
      const response = await fetch(`/api/coupons?id=${couponId}`, { method: "DELETE" });
      if (response.ok) {
        await refreshCoupons();
        showToast(`Coupon '${couponCode}' deleted successfully.`);
      } else {
        const errData = await response.json();
        showToast(errData.error || "Failed to delete coupon", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting coupon", "error");
    }
  };

  const handleToggleCouponActive = async (targetCoupon) => {
    try {
      const updated = {
        id: targetCoupon._id || targetCoupon.id,
        code: targetCoupon.code,
        title: targetCoupon.title,
        type: targetCoupon.type,
        discountValue: targetCoupon.discountValue,
        active: !targetCoupon.active
      };
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (response.ok) {
        await refreshCoupons();
        showToast(`Coupon '${targetCoupon.code}' is now ${!targetCoupon.active ? "Active" : "Inactive"}.`);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle coupon status", "error");
    }
  };

  // Data States
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [isLoadingHero, setIsLoadingHero] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const categoriesListToUse = adminCategories.length > 0
    ? adminCategories
    : [
      { name: "Cables" },
      { name: "Converters" },
      { name: "Accessories" },
      { name: "Surveillance" },
      { name: "Docking Stations" },
      { name: "Audio Video" },
      { name: "Networking" }
    ];

  const topSellingProducts = React.useMemo(() => {
    const map = {};
    if (Array.isArray(adminOrders)) {
      adminOrders.forEach((o) => {
        if (o.status !== "Cancelled" && Array.isArray(o.items)) {
          o.items.forEach((item) => {
            const key = item.id || item._id || item.name;
            if (!map[key]) {
              map[key] = {
                id: key,
                name: item.name,
                price: item.price || 0,
                image: item.image || "/logo.png",
                unitsSold: 0,
                totalRevenue: 0
              };
            }
            const qty = Number(item.qty || item.quantity || 1);
            map[key].unitsSold += qty;
            map[key].totalRevenue += (item.price || 0) * qty;
          });
        }
      });
    }
    return Object.values(map).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
  }, [adminOrders]);

  // Product Form Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    shortSpec: "",
    description: "",
    price: "",
    originalPrice: "",
    discountBadge: "",
    category: "",
    subcategory: "",
    image: "",
    gallery: [],
    sizes: [],
    privacySizes: [],
    channels: [],
    sizePrices: [],
    color: "",
    stock: "",
    isNewArrival: false,
    featured: false,
    topSelling: false
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, new, featured
  const [categoryFilter, setCategoryFilter] = useState("all"); // all, categoryName
  const [subcategoryFilter, setSubcategoryFilter] = useState("all"); // all, subcategoryName
  const [subTab, setSubTab] = useState("all"); // all, or category capsules

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [newCategorySubcategories, setNewCategorySubcategories] = useState([]);
  const [subcatInput, setSubcatInput] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddSubcategory = (e) => {
    if (e) e.preventDefault();
    const trimmed = subcatInput.trim();
    if (!trimmed) return;
    if (newCategorySubcategories.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      showToast("Subcategory already added", "error");
      return;
    }
    setNewCategorySubcategories((prev) => [...prev, trimmed]);
    setSubcatInput("");
  };

  const handleRemoveSubcategory = (subToRemove) => {
    setNewCategorySubcategories((prev) => prev.filter((s) => s !== subToRemove));
  };

  const [isUploading, setIsUploading] = useState(false);

  const compressAndConvertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (e, type = "product") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const base64Url = await compressAndConvertToBase64(file);
      if (type === "product") {
        setProductForm((prev) => ({ ...prev, image: base64Url }));
      } else if (type === "category") {
        setNewCategoryImage(base64Url);
      }
      showToast("Image processed successfully!");
    } catch (err) {
      console.error("Image processing error:", err);
      showToast("Failed to process image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch administrator records from MongoDB APIs
  const fetchAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [resProducts, resOrders, resCategories, resUsers] = await Promise.all([
        fetch("/api/products?excludeGallery=true").then((r) => r.json()).catch(() => null),
        fetch("/api/orders").then((r) => r.json()).catch(() => null),
        fetch("/api/categories").then((r) => r.json()).catch(() => null),
        fetch("/api/users").then((r) => r.json()).catch(() => null)
      ]);
      setAdminProducts(Array.isArray(resProducts) ? resProducts : (cartProducts || []));
      setAdminOrders(Array.isArray(resOrders) ? resOrders : []);
      setAdminCategories(Array.isArray(resCategories) ? resCategories : (cartCategories || []));
      setAdminUsers(Array.isArray(resUsers) ? resUsers : []);

      // Refresh global state cache to propagate changes instantly
      if (typeof refreshProducts === "function") refreshProducts();
      if (typeof refreshCategories === "function") refreshCategories();
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Admin email is NOT pre-filled — admin must enter it manually (security: never expose admin email in JS bundle)
  const defaultAdminEmail = "";

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.isLoggedIn && data.user && data.user.role === "Administrator") {
          setIsAdmin(true);
          localStorage.setItem("ravtron_session", JSON.stringify(data.user));
        } else {
          setIsAdmin(false);
          localStorage.removeItem("ravtron_session");
        }
      } catch (e) {
        console.error("Admin auth check error:", e);
        setIsAdmin(false);
      } finally {
        setIsAuthChecking(false);
        fetchAdminData();
      }
    };

    checkAdminAuth();
  }, []);

  const fetchHeroSlides = async () => {
    setIsLoadingHero(true);
    try {
      const res = await fetch("/api/hero");
      if (res.ok) {
        const data = await res.json();
        setHeroSlides(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error loading hero slides:", err);
      showToast("Error loading hero slides.", "error");
    } finally {
      setIsLoadingHero(false);
    }
  };

  const handleResetHero = async () => {
    if (confirm("Reset all Hero slides to their default hardcoded settings?")) {
      try {
        const response = await fetch("/api/hero", { method: "DELETE" });
        if (response.ok) {
          showToast("Hero slider reset to factory defaults.", "info");
          await fetchHeroSlides();
        } else {
          showToast("Failed to reset hero settings.", "error");
        }
      } catch (err) {
        console.error("Error resetting hero settings:", err);
        showToast("Error resetting hero settings.", "error");
      }
    }
  };

  useEffect(() => {
    if (activeTab === "hero") {
      fetchHeroSlides();
    }
  }, [activeTab]);

  const handleAdminAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: defaultAdminEmail,
          password: adminPassword,
          loginMode: "admin"
        })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem("ravtron_session", JSON.stringify(data.user));
        setIsAdmin(true);
        showToast("Access Granted. Welcome to Admin Panel.");
        fetchAdminData();
        return;
      } else {
        showToast(data.error || "Invalid administrative credentials.", "error");
      }
    } catch (err) {
      console.error("Admin Auth Error:", err);
      showToast("Server connection failed. Please try again.", "error");
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();


    if (!productForm.name || !productForm.name.trim()) {
      showToast("Please enter a product name.", "error");
      return;
    }

    if (!productForm.category || !productForm.category.trim()) {
      showToast("Please select a product category.", "error");
      return;
    }

    if (!productForm.price || isNaN(productForm.price) || Number(productForm.price) <= 0) {
      showToast("Please enter a valid product price greater than ₹0.", "error");
      return;
    }

    if (!productForm.shortSpec || !productForm.shortSpec.trim()) {
      showToast("Please enter a short specification / summary for the product.", "error");
      return;
    }

    if (productForm.stock === "" || productForm.stock === undefined || isNaN(productForm.stock) || Number(productForm.stock) < 0) {
      showToast("Please enter a valid stock quantity (0 or greater).", "error");
      return;
    }

    const priceNum = Number(productForm.price);
    const origPriceNum = Number(productForm.originalPrice || productForm.price);

    const productPayload = {
      name: productForm.name,
      shortSpec: productForm.shortSpec,
      description: productForm.description || "",
      price: priceNum,
      originalPrice: origPriceNum,
      discountBadge: productForm.discountBadge || "",
      category: productForm.category,
      subcategory: productForm.subcategory || "",
      image: productForm.image || (productForm.gallery?.[0] || "/logo.png"),
      gallery: productForm.gallery || [],
      sizes: productForm.sizes || [],
      privacySizes: productForm.privacySizes || [],
      channels: productForm.channels || [],
      sizePrices: (productForm.sizePrices || [])
        .filter((sp) => sp.size && sp.price)
        .map((sp) => ({
          size: sp.size,
          price: Number(sp.price),
          originalPrice: Number(sp.originalPrice || sp.price)
        })),
      color: productForm.color && productForm.color.trim() ? productForm.color.trim() : "Standard",
      stock: Number(productForm.stock || 0),
      isNewArrival: !!productForm.isNewArrival,
      featured: !!productForm.featured,
      topSelling: !!productForm.topSelling
    };

    try {
      if (editingProduct) {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(productPayload)
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to update product");
        }
        showToast("Product updated successfully!");
      } else {
        const newId = "p-" + Date.now();
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...productPayload,
            id: newId,
            rating: 4.8,
            reviewsCount: 1
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to create product");
        }
        showToast("New product added successfully!");
      }

      setIsProductModalOpen(false);
      await fetchAdminData();
    } catch (err) {
      console.error("Error saving product:", err);
      showToast(err.message || "Failed to save product.", "error");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE"
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to delete product");
        }
        // Clear hero slide cache so deleted product doesn't flash on next page refresh
        try { localStorage.removeItem("hero_slides_cache"); } catch (e) { }
        showToast("Product deleted successfully.", "info");
        await fetchAdminData();
      } catch (err) {
        console.error("Error deleting product:", err);
        showToast(err.message || "Failed to delete product.", "error");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const orderToUpdate = adminOrders.find((o) => o.id === orderId);
    if (!orderToUpdate) return;

    let statusColor = "text-amber-500 bg-amber-50";
    if (newStatus === "Delivered") statusColor = "text-emerald-500 bg-emerald-50";
    if (newStatus === "Shipped") statusColor = "text-sky-500 bg-sky-50";
    if (newStatus === "Cancelled") statusColor = "text-rose-500 bg-rose-50";
    if (newStatus === "Return Requested") statusColor = "text-purple-600 bg-purple-50";
    if (newStatus === "Return Approved") statusColor = "text-emerald-600 bg-emerald-50";
    if (newStatus === "Return Declined") statusColor = "text-rose-600 bg-rose-50";

    const currentSteps = orderToUpdate.trackingSteps ? [...orderToUpdate.trackingSteps] : [];

    const updatedSteps = currentSteps.map((step) => {
      if (step.title === newStatus) {
        return { ...step, date: new Date().toLocaleString(), done: true };
      }
      if (newStatus === "Delivered") {
        return { ...step, date: step.date === "Pending Delivery" || step.date === "Pending" ? new Date().toLocaleString() : step.date, done: true };
      }
      if (newStatus === "In Transit" && (step.title === "Order Placed" || step.title === "Packed & Verified" || step.title === "Shipped")) {
        return { ...step, done: true };
      }
      if (newStatus === "Shipped" && (step.title === "Order Placed" || step.title === "Packed & Verified")) {
        return { ...step, done: true };
      }
      if (newStatus === "Packed & Verified" && step.title === "Order Placed") {
        return { ...step, done: true };
      }
      return step;
    });

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus,
          statusColor,
          trackingSteps: updatedSteps
        })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update order status");
      }
      showToast(`Order status updated to: ${newStatus}`);
      await fetchAdminData();
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast(err.message || "Failed to update status.", "error");
    }
  };

  const handleEditCategoryClick = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryImage(category.image || "");
    setNewCategorySubcategories(Array.isArray(category.subcategories) ? category.subcategories : []);
    setSubcatInput("");
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    if (editingCategory) {
      try {
        const response = await fetch("/api/categories", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: editingCategory.name,
            newName: newCategoryName.trim(),
            image: newCategoryImage.trim() || "/logo.png",
            subcategories: newCategorySubcategories
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to update category");
        }
        setNewCategoryName("");
        setNewCategoryImage("");
        setNewCategorySubcategories([]);
        setSubcatInput("");
        setEditingCategory(null);
        showToast("Category updated successfully!");
        await fetchAdminData();
      } catch (err) {
        console.error("Error updating category:", err);
        showToast(err.message || "Failed to update category.", "error");
      }
    } else {
      const exists = adminCategories.some(
        (c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      );
      if (exists) {
        showToast("Category already exists.", "error");
        return;
      }

      try {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: newCategoryName.trim(),
            icon: "📦",
            image: newCategoryImage.trim() || "/logo.png",
            showOnHome: true,
            subcategories: newCategorySubcategories
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to add category");
        }
        setNewCategoryName("");
        setNewCategoryImage("");
        setNewCategorySubcategories([]);
        setSubcatInput("");
        showToast("Category added successfully!");
        await fetchAdminData();
      } catch (err) {
        console.error("Error adding category:", err);
        showToast(err.message || "Failed to add category.", "error");
      }
    }
  };

  const handleSetCategoryPosition = async (name, position) => {
    try {
      const response = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, homePosition: Number(position) })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update category position");
      }
      showToast(position > 0 ? `Category display position set to Position ${position}` : "Position reset to unranked.");
      await fetchAdminData();
    } catch (err) {
      console.error("Error updating category position:", err);
      showToast(err.message || "Failed to update category position.", "error");
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (confirm(`Delete category "${catName}"?`)) {
      try {
        const response = await fetch(`/api/categories?name=${encodeURIComponent(catName)}`, {
          method: "DELETE"
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to delete category");
        }
        showToast("Category deleted.", "info");
        await fetchAdminData();
      } catch (err) {
        console.error("Error deleting category:", err);
        showToast(err.message || "Failed to delete category.", "error");
      }
    }
  };

  const handleToggleUserRole = async (email) => {
    const userToUpdate = adminUsers.find((u) => u.email === email);
    if (!userToUpdate) return;
    const nextRole = userToUpdate.role === "Administrator" ? "Customer" : "Administrator";

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, role: nextRole })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update user role");
      }
      showToast("User access permissions updated.");
      await fetchAdminData();
    } catch (err) {
      console.error("Error updating user role:", err);
      showToast(err.message || "Failed to update user role.", "error");
    }
  };

  const handleToggleUserActive = async (email) => {
    const userToUpdate = adminUsers.find((u) => u.email === email);
    if (!userToUpdate) return;
    const nextActive = userToUpdate.active === false ? true : false;

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, active: nextActive })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update user status");
      }
      showToast(nextActive ? "User activated successfully." : "User deactivated successfully.");
      await fetchAdminData();
    } catch (err) {
      console.error("Error updating user status:", err);
      showToast(err.message || "Failed to update user status.", "error");
    }
  };


  const openProductForm = (productToEdit = null) => {
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setProductForm({
        name: productToEdit.name,
        shortSpec: productToEdit.shortSpec,
        description: productToEdit.description || "",
        price: productToEdit.price,
        originalPrice: productToEdit.originalPrice,
        discountBadge: productToEdit.discountBadge || "",
        category: productToEdit.category,
        subcategory: productToEdit.subcategory || "",
        image: productToEdit.image || "/logo.png",
        gallery: (Array.isArray(productToEdit.gallery) && productToEdit.gallery.length > 0)
          ? productToEdit.gallery
          : productToEdit.image
            ? [productToEdit.image]
            : ["/logo.png"],
        sizes: productToEdit.sizes || [],
        privacySizes: productToEdit.privacySizes || [],
        channels: productToEdit.channels || [],
        sizePrices: productToEdit.sizePrices || [],
        color: productToEdit.color || "",
        stock: productToEdit.stock ?? 0,
        isNewArrival: productToEdit.isNewArrival || false,
        featured: productToEdit.featured || false,
        topSelling: productToEdit.topSelling || false
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        shortSpec: "",
        description: "",
        price: "",
        originalPrice: "",
        discountBadge: "",
        category: categoriesListToUse[0]?.name || "Accessories",
        subcategory: "",
        image: "/logo.png",
        gallery: ["/logo.png"],
        sizes: [],
        privacySizes: [],
        channels: [],
        sizePrices: [],
        color: "",
        stock: 0,
        isNewArrival: true,
        featured: false,
        topSelling: false
      });
    }
    setIsProductModalOpen(true);
  };

  if (isAuthChecking && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-[#3674B5]" />
      </div>
    );
  }

  // Authentication protection check screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] antialiased flex flex-col justify-between">
        <main className="flex-grow flex items-center justify-center px-4 py-24 relative overflow-hidden">
          <div className="absolute top-1/10 left-1/10 w-96 h-96 rounded-full bg-[#E5D0C6] opacity-30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/10 right-1/10 w-96 h-96 rounded-full bg-[#E8EFE5] opacity-20 blur-3xl pointer-events-none" />

          <div className="w-full max-w-[420px] rounded-3xl bg-white border border-[#1E293B]/10 p-8 shadow-2xl relative z-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/20 flex items-center justify-center mx-auto text-[#3674B5]">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-[#1E293B]">Admin Authorization</h2>
              <p className="text-xs font-semibold text-[#1E293B]/50">Enter credentials to unlock administrative system capabilities.</p>
            </div>

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-[#1E293B]/60 uppercase tracking-wider">Access Key Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password (admin123)"
                  className="w-full bg-[#F8F9FA] border border-[#1E293B]/10 rounded-2xl px-4 py-3.5 text-xs font-semibold text-[#1E293B] placeholder-[#1E293B]/30 outline-none focus:bg-white focus:border-[#3674B5]"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-xs font-extrabold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <span>Authorize Terminal</span>
              </button>
            </form>
            <div className="pt-2">
              <button
                onClick={() => router.push("/")}
                className="text-xs font-bold text-[#3674B5] hover:text-[#578FCA] flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Filter logic for Products list (with defensive null checks)
  const productsToDisplay = adminProducts.length > 0 ? adminProducts : (cartProducts || []);
  const filteredProducts = productsToDisplay.filter((product) => {
    if (!product) return false;
    const nameStr = (product.name || "").toLowerCase();
    const specStr = (product.shortSpec || "").toLowerCase();
    const descStr = (product.description || "").toLowerCase();
    const catStr = (product.category || "").toLowerCase();
    const subCatStr = (product.subcategory || "").toLowerCase();
    const query = (searchQuery || "").toLowerCase();

    const matchesSearch = nameStr.includes(query) || specStr.includes(query) || descStr.includes(query) || subCatStr.includes(query);
    const matchesCategory = categoryFilter === "all" || catStr === categoryFilter.toLowerCase();
    const matchesSubTab = subTab === "all" || catStr === subTab.toLowerCase();

    let matchesSubcategory = true;
    if (subcategoryFilter !== "all") {
      const subTerm = subcategoryFilter.toLowerCase().trim();
      const subCatTrimmed = subCatStr.trim();

      if (subCatTrimmed) {
        matchesSubcategory = subCatTrimmed === subTerm;
      } else {
        const fullText = `${nameStr} ${catStr} ${specStr} ${descStr}`;
        const subWords = subTerm.split(/\s+/).filter(w => w.length > 1);
        matchesSubcategory =
          fullText.includes(subTerm) ||
          (subWords.length > 0 && subWords.every(word => fullText.includes(word)));
      }
    }

    let matchesStatus = true;
    if (statusFilter === "new") matchesStatus = !!product.isNewArrival;
    else if (statusFilter === "featured") matchesStatus = !!product.featured;
    else if (statusFilter === "active") matchesStatus = true;

    return matchesSearch && matchesCategory && matchesSubTab && matchesSubcategory && matchesStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-white text-[#1E293B] antialiased font-sans">

      {/* LEFT SIDEBAR (exactly matches screenshot layout design) */}
      <aside className="w-64 border-r border-slate-100 flex flex-col justify-between p-6 bg-white shrink-0 h-full">
        <div className="space-y-8">
          {/* Logo / Menu Header */}
          <div className="px-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MENU</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "overview"
                ? "bg-[#3674B5] text-white shadow-xs"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("products");
                setSubTab("all");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "products"
                ? "bg-slate-50 text-slate-900 font-bold"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <Package className="w-4 h-4 text-slate-400" />
              <span>Products</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "orders"
                ? "bg-slate-50 text-slate-900 font-bold"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span>Orders</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "users"
                ? "bg-slate-50 text-slate-900 font-bold"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "categories"
                ? "bg-slate-50 text-slate-900 font-bold"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <FolderPlus className="w-4 h-4 text-slate-400" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab("hero")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "hero"
                ? "bg-slate-50 text-slate-900 font-bold"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <Zap className="w-4 h-4 text-slate-400" />
              <span>Hero Manager</span>
            </button>

            <button
              onClick={() => setActiveTab("coupons")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "coupons"
                ? "bg-[#3674B5]/10 text-[#3674B5] font-extrabold"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
            >
              <Gift className="w-4 h-4 text-[#3674B5]" />
              <span>Coupons &amp; Offers</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer / Log out */}
        <div className="space-y-4 pt-4 border-t border-slate-100">

          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Go to Shop</span>
          </button>
          <button
            onClick={async () => {
              try {
                localStorage.removeItem("ravtron_session");
                localStorage.removeItem("ravtron_cart");
                localStorage.removeItem("ravtron_wishlist");
              } catch (e) { }
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } catch (e) {
                console.error("Logout API error:", e);
              }
              window.dispatchEvent(new Event("ravtron_auth_change"));
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow p-8 md:p-12 bg-slate-50/50 h-full overflow-y-auto">

        {/* TAB: OVERVIEW DASHBOARD */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">
                    Executive Store Overview
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Synced
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Real-time metrics for total revenue, active orders, low stock inventory alerts, and customer telemetry.
                </p>
              </div>

              <button
                onClick={fetchAdminData}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold transition-all shadow-xs flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? "animate-spin" : ""}`} />
                <span>Refresh Telemetry</span>
              </button>
            </div>

            {/* KPI METRICS GRID (4 CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {/* Gross Revenue */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gross Sales Revenue</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black font-display text-slate-900 tracking-tight">
                    ₹{adminOrders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <span>✓ From {adminOrders.filter(o => o.status !== "Cancelled").length} active orders</span>
                  </p>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Orders</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#3674B5] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black font-display text-slate-900 tracking-tight">
                    {adminOrders.length}
                  </h3>
                  <div className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-2">
                    <span className="text-[#3674B5]">{adminOrders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length} Pending</span>
                    <span>·</span>
                    <span className="text-purple-600">{adminOrders.filter(o => o.status === "Return Requested").length} Returns</span>
                  </div>
                </div>
              </div>

              {/* Product Catalog */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Inventory</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black font-display text-slate-900 tracking-tight">
                    {adminProducts.length} Products
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">
                    Across {categoriesListToUse.length} categories
                  </p>
                </div>
              </div>

              {/* Low Stock Alert Metric */}
              <div className={`border rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between space-y-4 ${adminProducts.filter(p => (p.stock ?? 0) <= 10).length > 0
                  ? "bg-rose-50/50 border-rose-200"
                  : "bg-white border-slate-200/80"
                }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Low Stock Alerts</span>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${adminProducts.filter(p => (p.stock ?? 0) <= 10).length > 0
                      ? "bg-rose-100 border-rose-300 text-rose-600"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-2xl font-black font-display tracking-tight ${adminProducts.filter(p => (p.stock ?? 0) <= 10).length > 0 ? "text-rose-600" : "text-slate-900"
                    }`}>
                    {adminProducts.filter(p => (p.stock ?? 0) <= 10).length} Items Alert
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">
                    {adminProducts.filter(p => (p.stock ?? 0) <= 10).length > 0 ? "Requires restock action" : "All stock levels healthy"}
                  </p>
                </div>
              </div>
            </div>

            {/* MAIN TWO-COLUMN DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

              {/* LEFT SIDE (7 COLS): LOW STOCK REPLENISHMENT MANAGER */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="font-display font-black text-base text-slate-900">
                      Low Stock Inventory Replenishment
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="text-xs font-extrabold text-[#3674B5] hover:underline flex items-center gap-1"
                  >
                    <span>View All Catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-4">
                  {adminProducts.filter(p => (p.stock ?? 0) <= 10).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-semibold text-slate-800">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[9px] tracking-wider text-slate-400 font-black">
                            <th className="p-3">Product</th>
                            <th className="p-3">Category</th>
                            <th className="p-3 text-center">Current Stock</th>
                            <th className="p-3 text-center">Quick Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminProducts
                            .filter(p => (p.stock ?? 0) <= 10)
                            .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
                            .map((p) => {
                              const stockVal = p.stock ?? 0;
                              return (
                                <tr key={p.id || p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                  <td className="p-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                                        <img src={p.image || "/logo.png"} alt={p.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-xs text-slate-900 truncate max-w-[180px]">{p.name}</h4>
                                        <span className="text-[10px] text-slate-400">₹{p.price}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-slate-500 font-medium">{p.category}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${stockVal <= 2
                                        ? "bg-rose-100 text-rose-700 animate-pulse"
                                        : "bg-amber-100 text-amber-700"
                                      }`}>
                                      {stockVal <= 2 ? `CRITICAL: ${stockVal}` : `LOW: ${stockVal}`}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleQuickRestock(p.id || p._id, stockVal, 10)}
                                      className="px-3 py-1.5 rounded-xl bg-[#3674B5] hover:bg-[#578FCA] text-white text-[10px] font-extrabold uppercase transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                                    >
                                      +10 Restock
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <h4 className="font-bold text-xs text-slate-900">Inventory Status Healthy</h4>
                      <p className="text-[11px] text-slate-400 font-medium">All products currently have 10+ units in stock.</p>
                    </div>
                  )}
                </div>

                {/* Best-Selling Products Leaderboard */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-display font-black text-base text-slate-900">
                        Top Best-Selling Products
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("products")}
                      className="text-xs font-extrabold text-[#3674B5] hover:underline"
                    >
                      Catalog
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-3">
                    {topSellingProducts.length > 0 ? (
                      topSellingProducts.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-slate-100 hover:border-slate-200 transition-all">
                          <div className="flex items-center gap-3.5">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${index === 0 ? "bg-amber-100 text-amber-800 border border-amber-300" :
                                index === 1 ? "bg-slate-200 text-slate-700 border border-slate-300" :
                                  index === 2 ? "bg-orange-100 text-orange-800 border border-orange-200" :
                                    "bg-slate-100 text-slate-500"
                              }`}>
                              #{index + 1}
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 truncate max-w-[200px]">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold">₹{item.price.toLocaleString()} unit price</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider block">
                              {item.unitsSold} Sold
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 mt-0.5 block">
                              ₹{item.totalRevenue.toLocaleString()} Revenue
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                        Sales leaderboard will calculate automatically as orders are placed.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE (5 COLS): RETURN REQUESTS & LIVE ORDERS STREAM */}
              <div className="lg:col-span-5 space-y-6">



                {/* Recent Orders Stream */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-base text-slate-900">
                      Recent Orders Stream
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-extrabold text-[#3674B5] hover:underline"
                    >
                      View All Orders
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-3">
                    {adminOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-slate-100 hover:border-slate-200 transition-all">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-[#1E293B]">{order.id}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{order.customerName} · {order.date}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-black text-xs text-[#3674B5]">₹{order.total.toLocaleString()}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${order.statusColor}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Coupons Quick Control Panel */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[#3674B5]" />
                      <h3 className="font-display font-black text-base text-slate-900">
                        Promo Offers Quick Control
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("coupons")}
                      className="text-xs font-extrabold text-[#3674B5] hover:underline"
                    >
                      Manage Offers
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-3">
                    {globalCoupons.length > 0 ? (
                      globalCoupons.map((c) => (
                        <div key={c._id || c.code} className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-slate-100">
                          <div className="space-y-1 truncate max-w-[190px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md font-mono">{c.code}</span>
                              <span className="text-[9px] font-bold text-[#3674B5]">{c.badgeType}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold truncate">{c.title}</p>
                          </div>
                          <div>
                            <button
                              onClick={() => handleToggleCouponActive(c)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase transition-all shadow-2xs cursor-pointer ${c.active !== false
                                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                  : "bg-slate-200 hover:bg-slate-300 text-slate-600"
                                }`}
                            >
                              {c.active !== false ? "Active ✓" : "Disabled ✕"}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-slate-400 text-xs font-semibold">
                        No promotional coupons created yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS (Exactly copies styling filters, capsules, tables and buttons from screenshot) */}
        {activeTab === "products" && (
          <div className="space-y-8 animate-fade-in">

            {/* Top header title and Add Product button */}
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">Products & Inventory</h1>
                <p className="text-xs text-slate-400 font-medium">Manage adapters, cables, docking stations and workspace inventories.</p>
              </div>
              <button
                onClick={() => openProductForm()}
                className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Capsules Sub-Navigation tabs (inside gray bar) */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-fit border border-slate-200/50">
                <button
                  onClick={() => {
                    setSubTab("all");
                    setCategoryFilter("all");
                    setSubcategoryFilter("all");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition-all ${subTab === "all" && categoryFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  All Categories
                </button>
                {categoriesListToUse.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSubTab(cat.name);
                      setCategoryFilter(cat.name);
                      setSubcategoryFilter("all");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition-all ${(subTab === cat.name || categoryFilter.toLowerCase() === cat.name.toLowerCase()) ? "bg-white text-[#3674B5] shadow-sm font-black" : "text-slate-500 hover:text-slate-900"
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Dynamic Subcategories Row (When a category is selected) */}
              {(() => {
                const activeCatName = subTab !== "all" ? subTab : categoryFilter;
                if (!activeCatName || activeCatName === "all") return null;
                const selectedCatObj = categoriesListToUse.find((c) => c.name.toLowerCase() === activeCatName.toLowerCase());
                const subcats = Array.isArray(selectedCatObj?.subcategories) ? selectedCatObj.subcategories : [];
                if (subcats.length === 0) return null;

                return (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#3674B5]/5 border border-[#3674B5]/20 rounded-2xl animate-fade-in">
                    <span className="text-[10px] font-black text-[#3674B5] uppercase tracking-wider px-2">
                      Subcategories:
                    </span>
                    <button
                      onClick={() => setSubcategoryFilter("all")}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase transition-all ${subcategoryFilter === "all" ? "bg-[#3674B5] text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}`}
                    >
                      All {activeCatName} Subcategories
                    </button>
                    {subcats.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSubcategoryFilter(sub)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase transition-all ${subcategoryFilter.toLowerCase() === sub.toLowerCase() ? "bg-[#3674B5] text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Search Input, Dropdown Status, Category and Subcategory Filter section */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="relative flex-grow max-w-xl">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-slate-300 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Catalog</option>
                  <option value="new">New Products Only</option>
                  <option value="featured">Featured on Home</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryFilter(val);
                    setSubTab(val);
                    setSubcategoryFilter("all");
                  }}
                  className="bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white"
                >
                  <option value="all">All Categories</option>
                  {categoriesListToUse.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>

                {(() => {
                  const activeCatName = categoryFilter !== "all" ? categoryFilter : subTab;
                  if (!activeCatName || activeCatName === "all") return null;
                  const selectedCatObj = categoriesListToUse.find((c) => c.name.toLowerCase() === activeCatName.toLowerCase());
                  const subcats = Array.isArray(selectedCatObj?.subcategories) ? selectedCatObj.subcategories : [];
                  if (subcats.length === 0) return null;

                  return (
                    <select
                      value={subcategoryFilter}
                      onChange={(e) => setSubcategoryFilter(e.target.value)}
                      className="bg-[#3674B5]/10 border border-[#3674B5]/30 rounded-xl px-3 py-2.5 text-xs font-extrabold text-[#3674B5] outline-none focus:bg-white"
                    >
                      <option value="all">All Subcategories</option>
                      {subcats.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  );
                })()}
              </div>
            </div>

            {/* Badges details layout style */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <div className="px-3.5 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                Results: <span className="font-black text-slate-900">{filteredProducts.length}</span>
              </div>
              <div className="px-3.5 py-1.5 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                Active: <span className="font-black text-emerald-800">{filteredProducts.length}</span>
              </div>
              <div className="px-3.5 py-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                New: <span className="font-black text-blue-800">{filteredProducts.filter(p => p.isNewArrival).length}</span>
              </div>
              <div className="px-3.5 py-1.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                Featured: <span className="font-black text-amber-800">{filteredProducts.filter(p => p.featured).length}</span>
              </div>
            </div>

            {/* Data Table component representation layout */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-800">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[9px] tracking-wider text-slate-400 font-black">
                      <th className="p-4 w-12 text-center">SNo</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Orig Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, index) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center">
                              <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{p.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{p.shortSpec}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 uppercase text-[9px] tracking-wider">
                          <span className="font-extrabold text-slate-900 block">{p.category}</span>
                          {p.subcategory ? (
                            <span className="inline-block mt-1 text-[9px] text-[#3674B5] font-extrabold bg-[#3674B5]/10 px-2 py-0.5 rounded-md border border-[#3674B5]/20">
                              {p.subcategory}
                            </span>
                          ) : (
                            <span className="block text-[8px] text-slate-400 font-semibold italic mt-0.5">
                              No Subcategory
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-900">₹{p.price.toLocaleString()}</td>
                        <td className="p-4 text-slate-400">₹{p.originalPrice.toLocaleString()}</td>
                        <td className="p-4">
                          {p.stock === 0 ? (
                            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black">
                              Out of Stock
                            </span>
                          ) : p.stock <= 5 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black">
                              {p.stock} Low
                            </span>
                          ) : (
                            <span className="text-slate-900 font-bold">{p.stock}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            {p.isNewArrival && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-blue-50 text-blue-600">
                                New
                              </span>
                            )}
                            {p.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-50 text-amber-600">
                                Featured
                              </span>
                            )}
                            {!p.isNewArrival && !p.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-emerald-50 text-emerald-600">
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openProductForm(p)}
                              className="p-1.5 rounded-lg border border-slate-150 bg-slate-50 hover:bg-slate-100 text-slate-600"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg border border-rose-100 bg-rose-50/30 text-rose-600 hover:bg-rose-50"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">Orders Queue</h1>
              <p className="text-xs text-slate-400 font-medium">Manage customer transactions, packages, and shipping milestones.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-800">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[9px] tracking-wider text-slate-400 font-black">
                      <th className="p-4 w-12 text-center">SNo</th>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Items Summary</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Tracking Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOrders.map((order, idx) => (
                      <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-4 font-bold text-slate-900 tracking-tight">{order.id}</td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">{order.customerName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{order.customerEmail}</p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">{order.date}</td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {order.items.map((item, idy) => (
                              <p key={idy} className="text-[10px] text-slate-600 truncate max-w-xs font-medium">
                                {item.name} <span className="font-bold text-slate-400">x{item.qty}</span>
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-[#3674B5]">₹{order.total.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${order.statusColor}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            <select
                              className="bg-slate-50 border border-slate-200/60 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 outline-none"
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="Order Placed">Order Placed</option>
                              <option value="Packed & Verified">Packed & Verified</option>
                              <option value="Shipped">Shipped</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CUSTOMERS/USERS */}
        {activeTab === "users" && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">Customers Database</h1>
              <p className="text-xs text-slate-400 font-medium">Verify profiles, register admin permissions, and view client active states.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-800">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[9px] tracking-wider text-slate-400 font-black">
                      <th className="p-4 w-12 text-center">SNo</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Access Role</th>
                      <th className="p-4">Join Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions / Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u, index) => (
                      <tr key={u.email} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="p-4 font-bold text-slate-900">
                          <button
                            onClick={() => setSelectedCustomer(u)}
                            className="hover:text-[#3674B5] hover:underline font-bold text-left outline-none cursor-pointer"
                          >
                            {u.name}
                          </button>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${u.role === "Administrator" ? "bg-[#3674B5]/10 text-[#3674B5]" : "bg-slate-100 text-slate-400"
                            }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{u.joinDate}</td>
                        <td className="p-4">
                          <span className={`w-2 h-2 rounded-full inline-block ${u.active !== false ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                          <span className="ml-1.5 text-[10px] font-semibold text-slate-500">{u.active !== false ? "Active" : "Disabled"}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedCustomer(u)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-all shadow-3xs flex items-center gap-1 cursor-pointer"
                              title="View Customer Profile"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => handleToggleUserActive(u.email)}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${u.active !== false
                                ? "border-amber-100 bg-amber-50/40 text-amber-600 hover:bg-amber-50"
                                : "border-emerald-100 bg-emerald-50/40 text-emerald-600 hover:bg-emerald-50"
                                }`}
                            >
                              {u.active !== false ? "Disable" : "Enable"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/25">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3674B5] animate-pulse" />
                <span className="text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
                  System Catalog
                </span>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">Manage Product Categories</h1>
                <p className="text-xs text-slate-400 font-medium">Add category classifications or modify existing configurations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Form card */}
              <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {editingCategory ? "Edit Category" : "New Category"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {editingCategory ? "Modify existing category details." : "Define a new category grouping."}
                    </p>
                  </div>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategoryName("");
                        setNewCategoryImage("");
                        setNewCategorySubcategories([]);
                        setSubcatInput("");
                      }}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cables, Adapters..."
                      className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Image</label>
                      {isUploading && <span className="text-[10px] text-[#3674B5] font-extrabold animate-pulse">Uploading...</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. /images/cable.png"
                          className="flex-1 bg-[#F8F9FA] border border-slate-200/60 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                          value={newCategoryImage}
                          onChange={(e) => setNewCategoryImage(e.target.value)}
                        />
                        <label className="flex items-center justify-center px-4 bg-[#3674B5]/10 hover:bg-[#3674B5]/20 border border-[#3674B5]/30 text-[#3674B5] text-xs font-bold rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-98">
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, "category")}
                            disabled={isUploading}
                          />
                        </label>
                      </div>

                      {/* Thumbnail Preview */}
                      {newCategoryImage && (
                        <div className="w-full h-16 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center overflow-hidden p-1">
                          <img src={newCategoryImage} alt="Category Preview" className="h-full max-w-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subcategories Manager Input */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Add Subcategories
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. CAT6 CABLE, HDMI..."
                        className="flex-1 bg-[#F8F9FA] border border-slate-200/60 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                        value={subcatInput}
                        onChange={(e) => setSubcatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSubcategory();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSubcategory}
                        className="px-3.5 py-2.5 bg-[#3674B5]/10 hover:bg-[#3674B5]/20 border border-[#3674B5]/30 text-[#3674B5] text-xs font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Active Subcategory Pills List */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {newCategorySubcategories.map((sub) => (
                        <span
                          key={sub}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1E293B] bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-3xs"
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubcategory(sub)}
                            className="text-slate-400 hover:text-rose-500 font-black text-xs leading-none"
                            title="Remove Subcategory"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {newCategorySubcategories.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No subcategories added yet.</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#3674B5] hover:bg-[#578FCA] text-white py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 shadow-md shadow-[#3674B5]/10"
                  >
                    {editingCategory ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Update Category</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Category</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Category Directory List */}
              <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Active Categories Directory</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Set home page position (max 6 slots) or manage subcategories.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Home Grid Featured (1-6):</span>
                    <span className={`text-xs font-black ${adminCategories.filter(c => c.homePosition >= 1 && c.homePosition <= 6).length >= 6 ? "text-emerald-600" : "text-amber-600"
                      }`}>
                      {adminCategories.filter(c => c.homePosition >= 1 && c.homePosition <= 6).length}/6
                    </span>
                  </div>
                </div>
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-800">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-[9px] tracking-wider text-slate-400 font-black">
                      <th className="p-4 w-12 text-center">SNo</th>
                      <th className="p-4">Category &amp; Subcategories</th>
                      <th className="p-4 text-center">Display Sequence Position</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminCategories.map((c, idx) => {
                      const iconObj = getCategoryIconDetails(c.name);
                      return (
                        <tr key={c.name} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                          <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-4 font-bold text-slate-900">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <span className={`flex items-center justify-center w-8 h-8 rounded-xl border ${iconObj.bg}`}>
                                  {iconObj.icon}
                                </span>
                                <span className="text-slate-800 text-sm font-semibold">{c.name}</span>
                              </div>
                              {Array.isArray(c.subcategories) && c.subcategories.length > 0 && (
                                <div className="flex flex-wrap gap-1 pl-11">
                                  {c.subcategories.map((sub) => (
                                    <span
                                      key={sub}
                                      className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md"
                                    >
                                      {sub}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <select
                              value={c.homePosition || 0}
                              onChange={(e) => handleSetCategoryPosition(c.name, Number(e.target.value))}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all outline-none cursor-pointer ${c.homePosition > 0
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                                }`}
                            >
                              <option value={0}>— Default (Unranked) —</option>
                              {Array.from({ length: Math.max(12, adminCategories.length + 3) }, (_, i) => i + 1).map((pos) => {
                                const occupant = adminCategories.find(cat => cat.name !== c.name && cat.homePosition === pos);
                                const isFeaturedHomeGrid = pos <= 6;
                                return (
                                  <option key={pos} value={pos}>
                                    Position {pos}{isFeaturedHomeGrid ? " (Home Grid Card)" : ""}{occupant ? ` — replaces ${occupant.name}` : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditCategoryClick(c)}
                                className="p-1.5 rounded-lg border border-slate-150 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all hover:scale-105 active:scale-95"
                                title="Edit Category"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c.name)}
                                className="p-1.5 rounded-lg border border-rose-100 bg-rose-50/30 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all hover:scale-105 active:scale-95"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* TAB: HERO MANAGER */}
        {activeTab === "hero" && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">Hero Section Manager</h1>
                <p className="text-xs text-slate-400 font-medium">Customize home page Hero slider images, tags, and product redirections.</p>
              </div>
              <button
                onClick={handleResetHero}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>

            {isLoadingHero ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">Loading hero configurations...</div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {[0, 1, 2].map((idx) => {
                  const existingSlide = heroSlides.find((s) => s.slideIndex === idx);
                  return (
                    <HeroSlideEditor
                      key={idx}
                      slideIndex={idx}
                      existingSlide={existingSlide}
                      products={adminProducts}
                      compressAndConvertToBase64={compressAndConvertToBase64}
                      showToast={showToast}
                      onSave={(updated) => {
                        setHeroSlides((prev) => {
                          const list = prev.filter((s) => s.slideIndex !== idx);
                          return [...list, updated].sort((a, b) => a.slideIndex - b.slideIndex);
                        });
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: COUPONS & OFFERS */}
        {activeTab === "coupons" && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">Coupons &amp; Promotional Offers</h1>
                <p className="text-xs text-slate-400 font-medium">Create festive deals, percentage discounts, flat ₹ offers, and category-specific promotional coupons.</p>
              </div>
              <button
                onClick={() => openCouponModal()}
                className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 w-fit"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            {couponsLoading ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">Loading available promotional coupons...</div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-slate-800">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[9px] tracking-wider text-slate-400 font-black">
                        <th className="p-4 w-12 text-center">SNo</th>
                        <th className="p-4">Coupon Code &amp; Title</th>
                        <th className="p-4">Badge / Type</th>
                        <th className="p-4">Discount</th>
                        <th className="p-4">Min Purchase</th>
                        <th className="p-4">Expiry Date</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(globalCoupons || []).map((c, index) => {
                        const isExpired = Boolean(c.expiryDate && new Date(c.expiryDate).setHours(23,59,59,999) < new Date());
                        return (
                          <tr key={c._id || c.code} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                            <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 text-xs tracking-wider bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                                    {c.code}
                                  </span>
                                  {isExpired && (
                                    <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">
                                      Expired
                                    </span>
                                  )}
                                </div>
                                <p className="font-bold text-slate-800 text-xs mt-1">{c.title}</p>
                                {c.description && <p className="text-[10px] text-slate-400 max-w-xs truncate">{c.description}</p>}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                                {c.badgeType || "🏷️ Promo"}
                              </span>
                            </td>
                            <td className="p-4 font-black text-[#3674B5] text-sm">
                              {c.type === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                            </td>
                            <td className="p-4 text-slate-600 font-bold">
                              {c.minPurchase > 0 ? `₹${c.minPurchase.toLocaleString()}` : "No Min Order"}
                            </td>
                            <td className="p-4 text-slate-600 font-bold text-xs">
                              {c.expiryDate ? (
                                <span className={isExpired ? "text-rose-600 font-extrabold" : "text-slate-700"}>
                                  📅 {c.expiryDate}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal italic">No Expiry (Never)</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleToggleCouponActive(c)}
                                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all shadow-2xs ${isExpired
                                    ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                                    : c.active
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                      : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                                  }`}
                              >
                                {isExpired ? "Expired" : c.active ? "Active" : "Disabled"}
                              </button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openCouponModal(c)}
                                className="p-1.5 rounded-lg border border-slate-150 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all"
                                title="Edit Coupon"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(c._id || c.id, c.code)}
                                className="p-1.5 rounded-lg border border-rose-100 bg-rose-50/30 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                      {(!globalCoupons || globalCoupons.length === 0) && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-xs text-slate-400 font-semibold italic">
                            No promotional coupons created yet. Click "+ Create New Coupon" above to add one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Product Form Modal (Add / Edit) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/30 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-100 p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fade-in">

            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingProduct ? "Edit Product Details" : "Add Product to Catalog"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure product specifications, categories, and pricing index.</p>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAVTRON 8-in-1 Type-C Docking Station"
                  className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-350"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              {/* Technical Feature Badges */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Feature Badges / Technical Specs
                  </label>
                  <span className="text-[9px] font-bold text-[#3674B5]">Separate with ( · ) or KEY: VALUE</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. INPUT: TYPE C MALE · OUTPUT: VGA · RESOLUTION: 1080P · DRIVER: PLUG & PLAY"
                  className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-350"
                  value={productForm.shortSpec}
                  onChange={(e) => setProductForm({ ...productForm, shortSpec: e.target.value })}
                />
                <p className="text-[9px] text-slate-400 font-medium">
                  Enter key specs or feature badges separated by dots (·). For example: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono text-[9px]">INPUT: TYPE C MALE · OUTPUT: VGA · RESOLUTION: 1080P</code>. These render as blue feature pills on the front-end product page.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">About Product (Description)</label>
                <textarea
                  placeholder="Enter detailed description of the product..."
                  rows={3}
                  className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-350"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4999"
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-350"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Price (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5999"
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-350"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Category & Subcategory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5]"
                    value={productForm.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setProductForm({ ...productForm, category: newCat });
                    }}
                  >
                    {categoriesListToUse.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const selectedCatObj = categoriesListToUse.find((c) => c.name.toLowerCase() === (productForm.category || "").toLowerCase());
                  const availableSubs = Array.isArray(selectedCatObj?.subcategories) ? selectedCatObj.subcategories : [];

                  const subOptions = [...availableSubs];
                  if (productForm.subcategory && !subOptions.some((s) => s.toLowerCase() === productForm.subcategory.toLowerCase())) {
                    subOptions.unshift(productForm.subcategory);
                  }

                  const activeSubcategoryDisplay = productForm.subcategory || editingProduct?.subcategory || "";

                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Subcategory
                        </label>
                        {activeSubcategoryDisplay && (
                          <span className="text-[9px] font-extrabold text-[#3674B5] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 uppercase tracking-wider">
                            Active: {activeSubcategoryDisplay}
                          </span>
                        )}
                      </div>
                      <select
                        className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5]"
                        value={productForm.subcategory}
                        onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                      >
                        <option value="">-- Select Subcategory (Optional) --</option>
                        {subOptions.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  );
                })()}
              </div>

              {/* Direct Subcategory Name Editor */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Custom / Current Subcategory Name
                  </label>
                  <span className="text-[9px] text-slate-400 font-semibold italic">Edit or type custom subcategory directly</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. POWER SUPPLY / CCTV, CAT6 CABLE, HDMI CONVERTER..."
                  className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                  value={productForm.subcategory}
                  onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                />
              </div>

              {/* Dynamic Channel Configurations (Power Supply / CCTV / Multi-channel products) */}
              <div className="space-y-3.5 border-t-2 border-[#3674B5]/20 bg-blue-50/40 p-4 rounded-2xl border text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-extrabold text-[#3674B5] uppercase tracking-wider">
                    ⚡ Channel Variants (e.g. 4 Channel, 8 Channel, 16 Channel)
                  </label>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#3674B5] text-white">
                    Power Supply / CCTV
                  </span>
                </div>

                {/* Common Presets */}
                <div className="space-y-1">
                  <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Common Channel Options</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "1 Channel",
                      "2 Channel",
                      "4 Channel",
                      "8 Channel",
                      "16 Channel",
                      "32 Channel"
                    ].map((ch) => {
                      const isChecked = productForm.channels?.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => {
                            let newChannels = [...(productForm.channels || [])];
                            if (newChannels.includes(ch)) {
                              newChannels = newChannels.filter((c) => c !== ch);
                            } else {
                              newChannels.push(ch);
                            }
                            setProductForm({ ...productForm, channels: newChannels });
                          }}
                          className={`px-3.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all duration-200 ${isChecked
                              ? "bg-[#3674B5] text-white border-[#3674B5] shadow-xs font-black scale-105"
                              : "bg-white text-slate-700 border-slate-250 hover:bg-slate-50 hover:text-slate-900 font-bold"
                            }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Add Channel */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Add Custom Channel</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 6 Channel, 12 Channel, 24 Channel"
                      className="flex-1 bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#3674B5] transition-all"
                      id="customChannelInput"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val && !productForm.channels?.includes(val)) {
                            setProductForm({
                              ...productForm,
                              channels: [...(productForm.channels || []), val]
                            });
                            e.target.value = "";
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("customChannelInput");
                        const val = input?.value.trim();
                        if (val && !productForm.channels?.includes(val)) {
                          setProductForm({
                            ...productForm,
                            channels: [...(productForm.channels || []), val]
                          });
                          input.value = "";
                        }
                      }}
                      className="px-4 bg-[#3674B5] text-white text-xs font-bold rounded-xl hover:bg-[#578FCA] transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Output Preview */}
                {productForm.channels && productForm.channels.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[9px] font-extrabold text-[#3674B5] uppercase tracking-wider">Configured Channels (Store Preview)</span>
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-white rounded-xl border border-blue-100 shadow-2xs">
                      {productForm.channels.map((ch) => (
                        <span
                          key={ch}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-[#3674B5] text-[10px] font-extrabold rounded-lg"
                        >
                          <span>{ch}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm({
                                ...productForm,
                                channels: productForm.channels.filter((c) => c !== ch)
                              });
                            }}
                            className="text-[#3674B5]/60 hover:text-rose-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[9px] text-slate-500 font-medium">
                  Select preset channel options or enter custom ones. Admins can add channels to any product.
                </p>
              </div>

              {/* Cable Sizes Configurations — Always Visible */}
              {true && (
                <div className="space-y-3.5 border-t border-slate-100 pt-3 text-left">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Available Cable Sizes & Custom Lengths
                  </label>

                  {/* Presets */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Presets</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["1.8 Mtr", "3.0 Mtr", "5 Mtr", "10 Mtr", "15 Mtr", "20 Mtr", "25 Mtr", "30 Mtr", "40 Mtr", "50 Mtr"].map((sz) => {
                        const isChecked = productForm.sizes?.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              let newSizes = [...(productForm.sizes || [])];
                              if (newSizes.includes(sz)) {
                                newSizes = newSizes.filter((s) => s !== sz);
                              } else {
                                newSizes.push(sz);
                              }
                              setProductForm({ ...productForm, sizes: newSizes });
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all duration-205 ${isChecked
                                ? "bg-black text-white border-black shadow-2xs font-extrabold"
                                : "bg-slate-50 text-slate-500 border-slate-250 hover:bg-slate-100 hover:text-slate-800 font-bold"
                              }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Custom Add Section */}
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Add Custom Length (e.g. meter, yard, ft)</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 5 Meter, 3 Yard, 10 Ft, 15 Mtr"
                        className="flex-1 bg-[#F8F9FA] border border-slate-200/65 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                        id="customLengthInput"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val && !productForm.sizes?.includes(val)) {
                              setProductForm({
                                ...productForm,
                                sizes: [...(productForm.sizes || []), val]
                              });
                              e.target.value = "";
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("customLengthInput");
                          const val = input?.value.trim();
                          if (val && !productForm.sizes?.includes(val)) {
                            setProductForm({
                              ...productForm,
                              sizes: [...(productForm.sizes || []), val]
                            });
                            input.value = "";
                          }
                        }}
                        className="px-4 bg-[#3674B5] text-white text-xs font-bold rounded-xl hover:bg-[#578FCA] transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Selected Output Preview */}
                  {productForm.sizes && productForm.sizes.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Currently Configured Sizes (Store Preview)</span>
                      <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#F8F9FA] rounded-xl border border-slate-200">
                        {productForm.sizes.map((sz) => (
                          <span
                            key={sz}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 text-[10px] font-bold rounded-lg shadow-3xs"
                          >
                            <span>{sz}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setProductForm({
                                  ...productForm,
                                  sizes: productForm.sizes.filter((s) => s !== sz)
                                });
                              }}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[9px] text-slate-400 font-medium">
                    Admins can enter any custom length/unit. These options will dynamically show up in the customer storefront size selector.
                  </p>
                </div>
              )}

              {/* Privacy Screen Size Configurations — Always Visible */}
              <div className="space-y-3.5 border-t border-slate-100 pt-3 text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Privacy Screen — Available Sizes &amp; Resolutions
                </label>

                {/* Presets */}
                <div className="space-y-1">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Common Laptop Screen Sizes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '12.5" 16:9 283x166mm',
                      '13.3" 16:9 300x176mm',
                      '13.3" 16:10 293x190mm',
                      '14" 16:9 316x184mm',
                      '14" 16:10 309x198mm',
                      '15.6" 16:9 351x204mm',
                      '15.6" 16:10 342x220mm',
                      '16" 16:10 344x215mm',
                      '17.3" 16:9 382x215mm'
                    ].map((sz) => {
                      const isChecked = productForm.privacySizes?.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            let newSizes = [...(productForm.privacySizes || [])];
                            if (newSizes.includes(sz)) {
                              newSizes = newSizes.filter((s) => s !== sz);
                            } else {
                              newSizes.push(sz);
                            }
                            setProductForm({ ...productForm, privacySizes: newSizes });
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all duration-205 ${isChecked
                              ? "bg-black text-white border-black shadow-2xs font-extrabold"
                              : "bg-slate-50 text-slate-500 border-slate-250 hover:bg-slate-100 hover:text-slate-800 font-bold"
                            }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Add Section */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Add Custom Size / Resolution</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder='e.g. 14" 16:9 309x174mm'
                      className="flex-1 bg-[#F8F9FA] border border-slate-200/65 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                      id="customPrivacySizeInput"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val && !productForm.privacySizes?.includes(val)) {
                            setProductForm({
                              ...productForm,
                              privacySizes: [...(productForm.privacySizes || []), val]
                            });
                            e.target.value = "";
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("customPrivacySizeInput");
                        const val = input?.value.trim();
                        if (val && !productForm.privacySizes?.includes(val)) {
                          setProductForm({
                            ...productForm,
                            privacySizes: [...(productForm.privacySizes || []), val]
                          });
                          input.value = "";
                        }
                      }}
                      className="px-4 bg-[#3674B5] text-white text-xs font-bold rounded-xl hover:bg-[#578FCA] transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Output Preview */}
                {productForm.privacySizes && productForm.privacySizes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Configured Sizes (Store Preview)</span>
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#F8F9FA] rounded-xl border border-slate-200">
                      {productForm.privacySizes.map((sz) => (
                        <span
                          key={sz}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 text-[10px] font-bold rounded-lg shadow-3xs"
                        >
                          <span>{sz}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm({
                                ...productForm,
                                privacySizes: productForm.privacySizes.filter((s) => s !== sz)
                              });
                            }}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[9px] text-slate-400 font-medium">
                  Select presets or type any custom size. These appear as selectable options on the product page for customers.
                </p>
              </div>

              {/* Variant Pricing overrides */}
              {((productForm.sizes && productForm.sizes.length > 0) ||
                (productForm.privacySizes && productForm.privacySizes.length > 0) ||
                (productForm.channels && productForm.channels.length > 0)) && (
                  <div className="space-y-3 border-t border-slate-100 pt-3 text-left">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Variant Specific Pricing overrides
                    </label>
                    <p className="text-[9px] text-slate-400 font-medium -mt-1 leading-normal">
                      Specify different prices for different length/size/channel segments. Leave blank to default to the base product price.
                    </p>
                    <div className="space-y-2 bg-slate-50/50 rounded-xl p-3 border border-slate-200/60 max-h-[220px] overflow-y-auto">
                      {[
                        ...(productForm.sizes || []),
                        ...(productForm.privacySizes || []),
                        ...(productForm.channels || [])
                      ].map((sz) => {
                        const currentOverride = (productForm.sizePrices || []).find((sp) => sp.size === sz) || { size: sz, price: "", originalPrice: "" };
                        return (
                          <div key={sz} className="grid grid-cols-12 gap-2 items-center">
                            <span className="col-span-4 text-[10px] font-extrabold text-slate-600 truncate" title={sz}>{sz}</span>
                            <div className="col-span-4">
                              <input
                                type="number"
                                required
                                placeholder="Price"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-800 outline-none focus:border-slate-350"
                                value={currentOverride.price}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  let newOverrides = [...(productForm.sizePrices || [])];
                                  const idx = newOverrides.findIndex((sp) => sp.size === sz);
                                  if (idx > -1) {
                                    newOverrides[idx] = { ...newOverrides[idx], price: val ? Number(val) : "" };
                                  } else {
                                    newOverrides.push({ size: sz, price: val ? Number(val) : "", originalPrice: "" });
                                  }
                                  setProductForm({ ...productForm, sizePrices: newOverrides });
                                }}
                              />
                            </div>
                            <div className="col-span-4">
                              <input
                                type="number"
                                placeholder="Orig Price"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-800 outline-none focus:border-slate-350"
                                value={currentOverride.originalPrice}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  let newOverrides = [...(productForm.sizePrices || [])];
                                  const idx = newOverrides.findIndex((sp) => sp.size === sz);
                                  if (idx > -1) {
                                    newOverrides[idx] = { ...newOverrides[idx], originalPrice: val ? Number(val) : "" };
                                  } else {
                                    newOverrides.push({ size: sz, price: "", originalPrice: val ? Number(val) : "" });
                                  }
                                  setProductForm({ ...productForm, sizePrices: newOverrides });
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Product Gallery (Up to 5 Images) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Product Images Gallery (Up to 5 Images)
                  </label>
                  {isUploading && (
                    <span className="text-[10px] text-[#3674B5] font-extrabold animate-pulse">
                      Uploading image...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((index) => {
                    const imgUrl = productForm.gallery?.[index];
                    return (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all group bg-[#F8F9FA] ${imgUrl
                          ? "border-slate-200"
                          : "border-dashed border-slate-300 hover:border-[#3674B5] hover:bg-slate-50"
                          }`}
                      >
                        {imgUrl ? (
                          <>
                            <img
                              src={imgUrl}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-contain p-1"
                            />
                            {/* Hover Overlay to Delete */}
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newGallery = [...productForm.gallery];
                                  newGallery.splice(index, 1);
                                  setProductForm({
                                    ...productForm,
                                    gallery: newGallery,
                                    image: newGallery[0] || "/logo.png"
                                  });
                                }}
                                className="p-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-[#3674B5]">
                            <Plus className="w-5 h-5 mb-0.5" />
                            <span className="text-[9px] font-bold uppercase">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                setIsUploading(true);
                                try {
                                  const base64Url = await compressAndConvertToBase64(file);
                                  const newGallery = [...(productForm.gallery || [])];
                                  newGallery[index] = base64Url;
                                  setProductForm({
                                    ...productForm,
                                    gallery: newGallery,
                                    image: newGallery[0] || base64Url
                                  });
                                  showToast("Image processed successfully!");
                                } catch (err) {
                                  console.error("Image processing error:", err);
                                  showToast("Failed to process image.", "error");
                                } finally {
                                  setIsUploading(false);
                                }
                              }}
                              disabled={isUploading}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  The first image will be set as the primary product cover image.
                </p>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 50"
                  className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-slate-350"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                />
              </div>

              {/* Status toggles */}
              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-200 text-slate-900"
                    checked={productForm.isNewArrival}
                    onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-200 text-slate-900"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  />
                  <span>Shop Section</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-200 text-slate-900"
                    checked={productForm.topSelling}
                    onChange={(e) => setProductForm({ ...productForm, topSelling: e.target.checked })}
                  />
                  <span>Top Selling Section</span>
                </label>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-100 p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fade-in text-left">
            <button
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCoupon ? "Edit Promotional Coupon" : "Create New Coupon / Festive Offer"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure coupon code, percentage/flat discounts, festive badges, and minimum order requirements.</p>
              </div>

              {/* Code */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20, WELCOME100, ACC15"
                  className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-black uppercase text-slate-800 outline-none focus:bg-white focus:border-[#3674B5]"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coupon Offer Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Special 20% OFF"
                  className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5]"
                  value={couponForm.title}
                  onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description / Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Valid on all Display Cables & Docking Stations."
                  className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5]"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Type</label>
                  <select
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:bg-white"
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%) OFF</option>
                    <option value="fixed">Fixed Amount (₹) OFF</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Discount Amount ({couponForm.type === "percentage" ? "%" : "₹"})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={couponForm.type === "percentage" ? "e.g. 20" : "e.g. 100"}
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-black text-slate-800 outline-none focus:bg-white focus:border-[#3674B5]"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                  />
                </div>
              </div>

              {/* Min Purchase & Applicable Target Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 999 (0 for no min)"
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                    value={couponForm.minPurchase}
                    onChange={(e) => setCouponForm({ ...couponForm, minPurchase: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicable Scope</label>
                  <select
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                    value={couponForm.applicableProductId ? "IndividualProduct" : (couponForm.applicableCategory || "All")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "IndividualProduct") {
                        setCouponForm({
                          ...couponForm,
                          applicableCategory: "All",
                          applicableProductId: adminProducts[0]?.id || adminProducts[0]?._id || "",
                          applicableProductName: adminProducts[0]?.name || ""
                        });
                      } else {
                        setCouponForm({
                          ...couponForm,
                          applicableCategory: val,
                          applicableProductId: "",
                          applicableProductName: ""
                        });
                      }
                    }}
                  >
                    <option value="All">🌐 All Categories & Products (Storewide)</option>
                    <optgroup label="Specific Category">
                      {categoriesListToUse.map((cat) => (
                        <option key={cat.name} value={cat.name}>📁 {cat.name} Category</option>
                      ))}
                    </optgroup>
                    <optgroup label="Individual Specific Product">
                      <option value="IndividualProduct">📦 Individual Specific Product...</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Individual Product Selector Dropdown */}
              {(couponForm.applicableProductId || couponForm.applicableCategory === "IndividualProduct") && (
                <div className="space-y-1.5 bg-[#3674B5]/5 border border-[#3674B5]/20 p-3.5 rounded-2xl">
                  <label className="block text-[10px] font-extrabold text-[#3674B5] uppercase tracking-wider">
                    Select Target Product ({adminProducts.length} Available)
                  </label>
                  <select
                    className="w-full bg-white border border-[#3674B5]/30 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-[#3674B5]"
                    value={couponForm.applicableProductId}
                    onChange={(e) => {
                      const selectedProd = adminProducts.find((p) => String(p.id) === String(e.target.value) || String(p._id) === String(e.target.value));
                      setCouponForm({
                        ...couponForm,
                        applicableProductId: e.target.value,
                        applicableProductName: selectedProd?.name || ""
                      });
                    }}
                  >
                    {adminProducts.map((prod) => (
                      <option key={prod.id || prod._id} value={prod.id || prod._id}>
                        {prod.name} (₹{prod.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Promo Badge Tag (Presets + Custom Brand Badge input) */}
              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Promo Badge Tag / Custom Brand Badge
                </label>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "🎁 Festive Offer",
                    "🏷️ Normal Coupon",
                    "🎉 First Order",
                    "⭐ Exclusive Offer",
                    "⚡ Limited Time",
                    "🔥 RAVTRON Special",
                    "💥 Flash Sale"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCouponForm({ ...couponForm, badgeType: preset })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${couponForm.badgeType === preset
                          ? "bg-[#3674B5] text-white border-[#3674B5] font-extrabold shadow-2xs scale-105"
                          : "bg-[#F8F9FA] text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Custom Brand Badge Input */}
                <div className="pt-1">
                  <input
                    type="text"
                    required
                    placeholder="or type custom badge e.g. 🔥 RAVTRON DEALS, 💥 DIWALI 2026"
                    className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
                    value={couponForm.badgeType}
                    onChange={(e) => setCouponForm({ ...couponForm, badgeType: e.target.value })}
                  />
                  <span className="text-[9px] text-slate-400 font-medium mt-1 block">
                    Admins can select a quick preset or type any custom brand badge title (with emojis if desired).
                  </span>
                </div>
              </div>

              {/* Expiration Date Section */}
              <div className="space-y-1.5 text-left bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                    📅 Expiration Date (Optional)
                  </label>
                  {couponForm.expiryDate && (
                    <button
                      type="button"
                      onClick={() => setCouponForm({ ...couponForm, expiryDate: "" })}
                      className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear Expiry
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#3674B5] transition-all"
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                />
                <span className="text-[9px] text-slate-500 font-medium block">
                  {couponForm.expiryDate
                    ? `Coupon will automatically expire at 11:59 PM on ${couponForm.expiryDate}.`
                    : "Leave empty for a permanent (never-expiring) promotional coupon."}
                </span>
              </div>

              {/* Single Use Per Customer Switch */}
              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-200 text-[#3674B5]"
                    checked={couponForm.oneTimePerUser}
                    onChange={(e) => setCouponForm({ ...couponForm, oneTimePerUser: e.target.checked })}
                  />
                  <span>Limit to 1-time use per customer (automatically hidden once used)</span>
                </label>
              </div>

              {/* Active Switch */}
              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-200 text-[#3674B5]"
                    checked={couponForm.active}
                    onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
                  />
                  <span>Active &amp; Claimable by Customers</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSavingCoupon}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {isSavingCoupon ? "Saving..." : editingCoupon ? "Update Coupon" : "Save & Create Coupon"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Profile & Orders Detail Modal */}
      {selectedCustomer && (() => {
        const custOrders = adminOrders.filter(
          (o) => o.customerEmail?.toLowerCase() === selectedCustomer.email?.toLowerCase() ||
            o.customerName?.toLowerCase() === selectedCustomer.name?.toLowerCase()
        );

        return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-100 p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fade-in text-left">

              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setExpandedOrderId(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3674B5]/10 border border-[#3674B5]/20 flex items-center justify-center text-[#3674B5] font-black text-sm uppercase">
                      {selectedCustomer.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Joined on {selectedCustomer.joinDate}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Email Address</span>
                    <span className="text-xs font-semibold text-slate-800">{selectedCustomer.email}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Access Role</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block ${selectedCustomer.role === "Administrator" ? "bg-[#3674B5]/10 text-[#3674B5]" : "bg-slate-200 text-slate-600"
                      }`}>
                      {selectedCustomer.role}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Account Status</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${selectedCustomer.active !== false ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                      <span className="text-xs font-semibold text-slate-800">{selectedCustomer.active !== false ? "Active (Enabled)" : "Disabled (Restricted)"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Orders Count</span>
                    <span className="text-xs font-black text-slate-800">{custOrders.length} orders placed</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase History & Tracking</h4>

                  {custOrders.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Orders Placed Yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
                      {custOrders.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        return (
                          <div key={order.id} className="border border-slate-100 rounded-xl bg-white shadow-2xs hover:border-slate-200 transition-colors overflow-hidden">
                            {/* Order Accordion Header */}
                            <div
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`text-[9px] text-slate-400 font-bold transition-transform duration-300 inline-block ${isExpanded ? 'rotate-90' : ''}`}>
                                  ▶
                                </span>
                                <span className="text-xs font-black text-slate-900">{order.id}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{order.date.split(" ")[0]}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${order.statusColor}`}>
                                  {order.status}
                                </span>
                                <span className="text-xs font-black text-[#3674B5]">₹{order.total.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Collapsible content details */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-1.5 border-t border-slate-50 bg-slate-50/30 space-y-3.5 animate-fade-in">
                                <div className="space-y-2 pl-2.5 border-l-2 border-slate-200">
                                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Items Details</p>
                                  {order.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex justify-between text-xs font-semibold text-slate-700">
                                      <span>{item.name} <span className="text-slate-400 font-medium">x{item.qty}</span></span>
                                      <span>{item.price ? `₹${item.price.toLocaleString()}` : ""}</span>
                                    </div>
                                  ))}
                                </div>

                                {order.status !== "Cancelled" && order.status !== "CANCELLED" && order.status !== "Delivered" && order.status !== "DELIVERED" ? (
                                  <div className="flex justify-end pt-1">
                                    <button
                                      type="button"
                                      onClick={async (e) => {
                                        e.stopPropagation(); // Prevent toggling accordion state
                                        if (confirm(`Are you sure you want to cancel order ${order.id}?`)) {
                                          await handleUpdateOrderStatus(order.id, "Cancelled");
                                          showToast(`Order ${order.id} cancelled successfully.`);
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/30 text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                                    >
                                      Cancel Order
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setExpandedOrderId(null);
                    }}
                    className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      <SearchModal />
    </div>
  );
}

function HeroSlideEditor({
  slideIndex,
  existingSlide,
  products,
  onSave,
  compressAndConvertToBase64,
  showToast
}) {
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
      tag1: "Smart Bank", tag1Desc: "OLED Diagnostics",
      tag2: "Hi-Fi Buds", tag2Desc: "ANC Workspace",
      tag3: "USB-C Cable", tag3Desc: "100W PD Power"
    }
  ];

  const slideDefaults = defaultSlides[slideIndex] || {};

  const [disconnected, setDisconnected] = useState("");
  const [connected, setConnected] = useState("");
  const [productId, setProductId] = useState("");
  const [tag1, setTag1] = useState("");
  const [tag1Desc, setTag1Desc] = useState("");
  const [tag2, setTag2] = useState("");
  const [tag2Desc, setTag2Desc] = useState("");
  const [tag3, setTag3] = useState("");
  const [tag3Desc, setTag3Desc] = useState("");

  const [isUploadingConnected, setIsUploadingConnected] = useState(false);
  const [isUploadingDisconnected, setIsUploadingDisconnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingSlide) {
      setDisconnected(existingSlide.disconnected || "");
      setConnected(existingSlide.connected || "");
      setProductId(existingSlide.productId || "");
      setTag1(existingSlide.tag1 || "");
      setTag1Desc(existingSlide.tag1Desc || "");
      setTag2(existingSlide.tag2 || "");
      setTag2Desc(existingSlide.tag2Desc || "");
      setTag3(existingSlide.tag3 || "");
      setTag3Desc(existingSlide.tag3Desc || "");
    } else {
      setDisconnected(slideDefaults.disconnected || "");
      setConnected(slideDefaults.connected || "");
      setProductId(slideDefaults.productId || "");
      setTag1(slideDefaults.tag1 || "");
      setTag1Desc(slideDefaults.tag1Desc || "");
      setTag2(slideDefaults.tag2 || "");
      setTag2Desc(slideDefaults.tag2Desc || "");
      setTag3(slideDefaults.tag3 || "");
      setTag3Desc(slideDefaults.tag3Desc || "");
    }
  }, [existingSlide]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "connected") setIsUploadingConnected(true);
    else setIsUploadingDisconnected(true);

    try {
      const base64Url = await compressAndConvertToBase64(file);
      if (type === "connected") {
        setConnected(base64Url);
      } else {
        setDisconnected(base64Url);
      }
      showToast(`${type === "connected" ? "Connected" : "Disconnected"} image uploaded successfully!`);
    } catch (err) {
      console.error(err);
      showToast("Failed to process image.", "error");
    } finally {
      if (type === "connected") setIsUploadingConnected(false);
      else setIsUploadingDisconnected(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!productId) {
      showToast("Please select a target product.", "error");
      return;
    }
    if (!disconnected || !connected) {
      showToast("Both connected and disconnected images are required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideIndex,
          disconnected,
          connected,
          productId,
          tag1,
          tag1Desc,
          tag2,
          tag2Desc,
          tag3,
          tag3Desc
        })
      });
      if (response.ok) {
        const updated = await response.json();
        onSave(updated);
        showToast(`Slide ${slideIndex + 1} settings saved!`);
      } else {
        const errData = await response.json();
        showToast(errData.error || "Failed to save slide settings.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving slide settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 text-left">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-base text-slate-900">Hero Slide #{slideIndex + 1}</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Configure the connected/disconnected state images, tags, and product link.</p>
        </div>
        {existingSlide ? (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-black uppercase">Custom Active</span>
        ) : (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-400 border border-slate-200 rounded text-[9px] font-black uppercase">Factory Default</span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images Section */}
          <div className="space-y-4 text-left">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Slide Images</h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Disconnected State Image */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Disconnected Image</label>
                  {isUploadingDisconnected && <span className="text-[9px] text-[#3674B5] font-extrabold animate-pulse">Uploading...</span>}
                </div>
                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 p-2">
                  {disconnected ? (
                    <img src={disconnected} alt="Disconnected view" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-slate-300 text-xs font-bold">No Image</span>
                  )}
                </div>
                <label className="w-full flex items-center justify-center py-2 px-3 bg-[#3674B5]/5 hover:bg-[#3674B5]/10 border border-[#3674B5]/20 text-[#3674B5] text-[11px] font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-98">
                  <span>Change Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "disconnected")} disabled={isUploadingDisconnected} />
                </label>
              </div>

              {/* Connected State Image */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Connected Image</label>
                  {isUploadingConnected && <span className="text-[9px] text-[#3674B5] font-extrabold animate-pulse">Uploading...</span>}
                </div>
                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 p-2">
                  {connected ? (
                    <img src={connected} alt="Connected view" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-slate-300 text-xs font-bold">No Image</span>
                  )}
                </div>
                <label className="w-full flex items-center justify-center py-2 px-3 bg-[#3674B5]/5 hover:bg-[#3674B5]/10 border border-[#3674B5]/20 text-[#3674B5] text-[11px] font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-98">
                  <span>Change Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "connected")} disabled={isUploadingConnected} />
                </label>
              </div>
            </div>
          </div>

          {/* Links & Tags Section */}
          <div className="space-y-4 text-left">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Settings & Content</h4>

            {/* Product Redirection Select */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">On-Click Target Product Redirection</label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3674B5] transition-all"
              >
                <option value="">-- Select Target Product --</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    [{prod.category}] {prod.name} (₹{prod.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Inputs */}
            <div className="space-y-3 pt-2 text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Floating Info Chips Text</label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Tag 1 Label</span>
                  <input type="text" placeholder="e.g. Pro HDMI 2.1" className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white" value={tag1} onChange={(e) => setTag1(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Tag 1 Description</span>
                  <input type="text" placeholder="e.g. 8K Resolution" className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white" value={tag1Desc} onChange={(e) => setTag1Desc(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Tag 2 Label</span>
                  <input type="text" placeholder="e.g. Docking Hub" className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white" value={tag2} onChange={(e) => setTag2(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Tag 2 Description</span>
                  <input type="text" placeholder="e.g. 10-in-1 output" className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white" value={tag2Desc} onChange={(e) => setTag2Desc(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Tag 3 Label</span>
                  <input type="text" placeholder="e.g. CAT6 SFTP" className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white" value={tag3} onChange={(e) => setTag3(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Tag 3 Description</span>
                  <input type="text" placeholder="e.g. 10Gbps Speed" className="w-full bg-[#F8F9FA] border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white" value={tag3Desc} onChange={(e) => setTag3Desc(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100/65">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? "Saving slide..." : "Save Slide Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
