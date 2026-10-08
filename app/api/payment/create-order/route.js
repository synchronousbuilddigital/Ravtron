import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { calculateVerifiedCouponDiscount } from "@/lib/couponSecurity";
import { verifyCsrfOrigin } from "@/lib/csrf";
import { calculateDeliveryCharge } from "@/lib/shipping";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Idempotency cache for preventing duplicate Razorpay orders on rapid concurrent requests
const orderIdempotencyCache = new Map();
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of orderIdempotencyCache.entries()) {
      if (now - v.timestamp > 3 * 60 * 1000) {
        orderIdempotencyCache.delete(k);
      }
    }
  }, 5 * 60 * 1000);
}

// Helper to safely initialize Razorpay without crashing build evaluation
function getRazorpayInstance() {
  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder").trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || "placeholder_secret").trim();
  return new Razorpay({ key_id, key_secret });
}

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = await rateLimit(`pay_create_${clientIp}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many payment creation requests. Please wait 1 minute before trying again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;

    const body = await request.json();
    const { items, deliveryPref, coupon, currency = "INR", notes, idempotencyKey } = body;

    // Check server-side idempotency header / body key
    const effectiveIdempotencyKey = request.headers.get("idempotency-key") || idempotencyKey;
    if (effectiveIdempotencyKey && orderIdempotencyCache.has(effectiveIdempotencyKey)) {
      const cached = orderIdempotencyCache.get(effectiveIdempotencyKey);
      return NextResponse.json({
        razorpay_order_id: cached.razorpay_order_id,
        amount: cached.amount,
        currency: cached.currency,
        verifiedTotal: cached.verifiedTotal,
      });
    }

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
      if (!item || !item.productId) {
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
      let price = Number(product.price) || 0;
      if (item.selectedSize && Array.isArray(product.sizePrices)) {
        const sizePriceObj = product.sizePrices.find(
          (sp) => sp.size === item.selectedSize
        );
        if (sizePriceObj && Number(sizePriceObj.price) > 0) {
          price = Number(sizePriceObj.price);
        }
      }

      const rawQty = Number(item.qty || item.quantity || 1);
      const qty = (!Number.isFinite(rawQty) || rawQty < 1) ? 1 : Math.min(100, Math.floor(rawQty));
      subtotal += price * qty;
    }

    // Server-side coupon validation (100% secure)
    const validatedItemsForCoupon = items.map((item) => {
      const rawQty = Number(item.qty || item.quantity || 1);
      const qty = (!Number.isFinite(rawQty) || rawQty < 1) ? 1 : Math.min(100, Math.floor(rawQty));
      return {
        productId: item.productId,
        selectedSize: item.selectedSize || null,
        price: Number(item.price) || 0,
        qty
      };
    });

    const { verifiedSavings } = await calculateVerifiedCouponDiscount({
      couponCodeInput: coupon,
      customerEmail,
      validatedItems: validatedItemsForCoupon,
      subtotal
    });

    // Recalculate order total server-side securely (no GST, pure price + delivery):
    // Delivery policy: ₹99 on orders under ₹300; ₹0 (FREE) on ₹300 and above.
    const deliveryCharge = calculateDeliveryCharge(subtotal);
    const discountedSubtotal = Math.max(0, subtotal - verifiedSavings);
    const verifiedTotal = discountedSubtotal + deliveryCharge;

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
      notes: {
        customerEmail: customerEmail || "",
        customerName: notes?.customerName || session.name || "Customer",
        customerPhone: notes?.customerPhone || "",
        shippingStreet: (notes?.shippingStreet || "").slice(0, 200),
        shippingCity: (notes?.shippingCity || "").slice(0, 100),
        shippingState: (notes?.shippingState || "").slice(0, 100),
        shippingZip: (notes?.shippingZip || "").slice(0, 20),
        coupon: (coupon || "").slice(0, 50),
        deliveryPref: deliveryPref || "standard",
        itemsSummary: JSON.stringify(
          items.slice(0, 8).map((it) => ({
            id: it.productId,
            sz: it.selectedSize || "",
            q: Number(it.qty || it.quantity || 1),
          }))
        ).slice(0, 250),
      },
    });

    const responsePayload = {
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      verifiedTotal, // Send back so frontend can display confirmed amount
    };

    if (effectiveIdempotencyKey) {
      orderIdempotencyCache.set(effectiveIdempotencyKey, {
        ...responsePayload,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(responsePayload);
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
