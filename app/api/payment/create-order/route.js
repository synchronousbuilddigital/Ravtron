import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { calculateVerifiedCouponDiscount } from "@/lib/couponSecurity";
import { verifyCsrfOrigin } from "@/lib/csrf";

// Helper to safely initialize Razorpay without crashing build evaluation
function getRazorpayInstance() {
  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder").trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || "placeholder_secret").trim();
  return new Razorpay({ key_id, key_secret });
}

export async function POST(request) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;

    const body = await request.json();
    const { items, deliveryPref, coupon, currency = "INR", notes } = body;

    // ── 1. Auth guard — read email from the SIGNED SESSION COOKIE, not the body ──
    // SECURITY FIX: Never trust customerEmail from the request body.
    // Always derive identity from the cryptographically signed server-side session.
    const session = await getSession();
    if (!session || !session.email) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing user session" },
        { status: 403 }
      );
    }
    const customerEmail = session.email; // Trusted source — HMAC-signed cookie

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required to create a payment order" },
        { status: 400 }
      );
    }

    // ── 2. SECURITY: Recalculate amount server-side from DB prices ────────────
    // NEVER trust the amount sent from the frontend — always fetch from DB.
    await dbConnect();

    let subtotal = 0;

    for (const item of items) {
      if (!item.productId) {
        return NextResponse.json(
          { error: `Missing productId for cart item` },
          { status: 400 }
        );
      }

      const product = await Product.findOne({ id: item.productId });
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      // Respect size-based pricing if applicable
      let price = product.price;
      if (item.selectedSize && Array.isArray(product.sizePrices)) {
        const sizePriceObj = product.sizePrices.find(
          (sp) => sp.size === item.selectedSize
        );
        if (sizePriceObj) price = sizePriceObj.price;
      }

      const qty = Math.max(1, Number(item.qty || item.quantity || 1));
      subtotal += price * qty;
    }

    // Server-side coupon validation (100% secure)
    const validatedItemsForCoupon = items.map((item) => ({
      productId: item.productId,
      selectedSize: item.selectedSize || null,
      price: item.price || 0,
      qty: Math.max(1, Number(item.qty || item.quantity || 1))
    }));

    const { verifiedSavings } = await calculateVerifiedCouponDiscount({
      couponCodeInput: coupon,
      customerEmail,
      validatedItems: validatedItemsForCoupon,
      subtotal
    });

    // Recalculate delivery + GST server-side
    const deliveryCharge = deliveryPref === "express" ? 199 : subtotal > 999 ? 0 : 99;
    const taxableAmount = Math.max(0, subtotal - verifiedSavings);
    const taxAmount = Math.round(taxableAmount * 0.18); // 18% GST
    const verifiedTotal = taxableAmount + deliveryCharge + taxAmount;

    if (verifiedTotal <= 0) {
      return NextResponse.json(
        { error: "Calculated order total is invalid" },
        { status: 400 }
      );
    }

    // ── 3. Create Razorpay order with server-verified amount ─────────────────
    // Razorpay accepts amount in the SMALLEST currency unit (paise for INR)
    const amountInPaise = Math.round(verifiedTotal * 100);

    // SECURITY FIX: Validate key format (must start with rzp_test_ or rzp_live_)
    // This catches misconfigured keys faster than waiting for Razorpay's API error.
    const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();
    const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (
      !razorpayKeyId ||
      !razorpayKeySecret ||
      (!razorpayKeyId.startsWith("rzp_test_") && !razorpayKeyId.startsWith("rzp_live_"))
    ) {
      return NextResponse.json(
        { error: "Razorpay API keys are not configured correctly in environment variables." },
        { status: 500 }
      );
    }

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    // SECURITY FIX: Do NOT expose key_id in the server response.
    // The frontend reads NEXT_PUBLIC_RAZORPAY_KEY_ID directly from env — no need to pass it here.
    return NextResponse.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      verifiedTotal, // Send back so frontend can display confirmed amount
    });
  } catch (error) {
    // Avoid leaking internal error details in production
    const isProduction = process.env.NODE_ENV === "production";
    console.error("[PAYMENT] Create order error:", isProduction ? error.message : error);
    return NextResponse.json(
      { error: isProduction ? "Failed to create payment order" : (error.message || "Failed to create payment order") },
      { status: 500 }
    );
  }
}
