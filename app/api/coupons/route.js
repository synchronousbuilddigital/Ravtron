import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import { getCachedCoupons, setCachedCoupons, clearCouponsCache } from "@/lib/cache";
import { verifyAdmin, getSession } from "@/lib/auth";
import { verifyCsrfOrigin } from "@/lib/csrf";
import { escapeRegex } from "@/lib/security";

export const dynamic = "force-dynamic";

const DEFAULT_COUPONS = [
  {
    code: "FESTIVE20",
    title: "Festive Season Special 20% OFF",
    description: "Get 20% OFF on all Display Cables, Docking Stations, and Converters.",
    type: "percentage",
    discountValue: 20,
    minPurchase: 0,
    applicableCategory: "All",
    badgeType: "Festive Offer",
    active: true
  },
  {
    code: "WELCOME100",
    title: "Flat ₹100 Discount on First Order",
    description: "Enjoy ₹100 instant discount on orders above ₹999.",
    type: "fixed",
    discountValue: 100,
    minPurchase: 999,
    applicableCategory: "All",
    badgeType: "First Order",
    active: true
  },
  {
    code: "ACC15",
    title: "15% OFF Workspace Accessories",
    description: "Exclusive discount on Webcams, Privacy Filters, Adapters & Stands.",
    type: "percentage",
    discountValue: 15,
    minPurchase: 499,
    applicableCategory: "Accessories",
    badgeType: "Exclusive Offer",
    active: true
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url || "http://localhost");
    const paramEmail = searchParams.get("email");
    const forAdmin = searchParams.get("forAdmin") === "true";

    const session = await getSession();
    const userEmail = paramEmail || (session?.isLoggedIn ? session.email : null);

    await dbConnect();
    let coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();

    if (!coupons || coupons.length === 0) {
      coupons = await Coupon.insertMany(DEFAULT_COUPONS);
    }

    // Cache overall coupon list for admin / general queries
    if (!userEmail && !forAdmin) {
      setCachedCoupons(coupons);
    }

    // If user is authenticated / email provided, hide coupons they have already used
    if (userEmail && !forAdmin) {
      const userOrders = await Order.find({
        customerEmail: new RegExp(`^${escapeRegex(userEmail.trim())}$`, "i"),
        status: { $ne: "Cancelled" }
      }).select("coupon").lean();

      const usedCodes = new Set(
        userOrders
          .map((o) => (o.coupon ? o.coupon.trim().toUpperCase() : null))
          .filter(Boolean)
      );

      coupons = coupons.filter((c) => {
        const isOneTime = c.oneTimePerUser !== false; // Default true
        if (isOneTime && usedCodes.has(c.code.toUpperCase())) {
          return false; // HIDE coupon from this user because they already used it!
        }
        return true;
      });
    }

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("GET /api/coupons error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to retrieve coupons" : (error.message || "Failed to retrieve coupons") },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }
    await dbConnect();
    const body = await request.json();
    const { id, code, title, description, type, discountValue, minPurchase, applicableCategory, applicableProductId, applicableProductName, badgeType, expiryDate, oneTimePerUser, active } = body;

    if (!code || !title || discountValue === undefined) {
      return NextResponse.json({ error: "Coupon code, title, and discount value are required" }, { status: 400 });
    }

    const uppercaseCode = code.trim().toUpperCase();

    if (id) {
      // Edit existing coupon
      const updated = await Coupon.findByIdAndUpdate(
        id,
        {
          code: uppercaseCode,
          title: title.trim(),
          description: description || "",
          type: type || "percentage",
          discountValue: Number(discountValue),
          minPurchase: Number(minPurchase || 0),
          applicableCategory: applicableCategory || "All",
          applicableProductId: applicableProductId || "",
          applicableProductName: applicableProductName || "",
          badgeType: badgeType || "Festive Offer",
          expiryDate: expiryDate || "",
          oneTimePerUser: oneTimePerUser !== undefined ? oneTimePerUser : true,
          active: active !== undefined ? active : true
        },
        { new: true }
      );
      clearCouponsCache();
      return NextResponse.json(updated);
    } else {
      // Create new coupon
      const existing = await Coupon.findOne({ code: uppercaseCode });
      if (existing) {
        return NextResponse.json({ error: `Coupon code '${uppercaseCode}' already exists.` }, { status: 400 });
      }

      const created = await Coupon.create({
        code: uppercaseCode,
        title: title.trim(),
        description: description || "",
        type: type || "percentage",
        discountValue: Number(discountValue),
        minPurchase: Number(minPurchase || 0),
        applicableCategory: applicableCategory || "All",
        applicableProductId: applicableProductId || "",
        applicableProductName: applicableProductName || "",
        badgeType: badgeType || "Festive Offer",
        expiryDate: expiryDate || "",
        oneTimePerUser: oneTimePerUser !== undefined ? oneTimePerUser : true,
        active: active !== undefined ? active : true
      });
      clearCouponsCache();
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/coupons error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to save coupon" : (error.message || "Failed to save coupon") },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const code = searchParams.get("code");

    if (!id && !code) {
      return NextResponse.json({ error: "Coupon ID or Code is required" }, { status: 400 });
    }

    let deleted;
    if (id) {
      deleted = await Coupon.findByIdAndDelete(id);
    } else {
      deleted = await Coupon.findOneAndDelete({ code: code.toUpperCase() });
    }

    if (!deleted) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    clearCouponsCache();
    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/coupons error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to delete coupon" : (error.message || "Failed to delete coupon") },
      { status: 500 }
    );
  }
}
