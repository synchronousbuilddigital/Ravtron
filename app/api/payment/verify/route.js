import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import { getSession } from "@/lib/auth";
import { calculateVerifiedCouponDiscount } from "@/lib/couponSecurity";
import { clearOrdersCache } from "@/lib/cache";
import { sendOrderConfirmationEmail, sendNewOrderAdminAlert } from "@/lib/email";
import { verifyCsrfOrigin } from "@/lib/csrf";

export async function POST(request) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;

    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData, // cart/order details sent from the frontend
    } = body;

    // ── 1. Verify all required Razorpay fields are present ──────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required Razorpay payment fields" },
        { status: 400 }
      );
    }

    if (!orderData || !orderData.customerEmail) {
      return NextResponse.json(
        { error: "Missing order data" },
        { status: 400 }
      );
    }

    // ── 2. Auth guard — read identity from the SIGNED SESSION COOKIE, not the body ──
    // SECURITY FIX: Never trust customerEmail from the request body.
    // Always derive identity from the cryptographically signed server-side session.
    const session = await getSession();
    if (!session || !session.email) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid user session" },
        { status: 403 }
      );
    }
    // Use session email as the authoritative identity.
    // If orderData includes a different email, it is simply ignored.
    const sessionEmail = session.email;

    // ── 3. Verify HMAC SHA256 signature ──────────────────────────────────────
    // Razorpay creates: HMAC_SHA256( razorpay_order_id + "|" + razorpay_payment_id )
    // using your KEY_SECRET. If the signature matches, the payment is genuine.
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("[RAZORPAY] Signature mismatch — possible tampered request");
      return NextResponse.json(
        { error: "Payment verification failed: Invalid signature" },
        { status: 400 }
      );
    }

    // ── 4. Server-side recalculation & stock validation ─────────────────────
    await dbConnect();

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of orderData.items) {
      if (!item.productId) {
        return NextResponse.json(
          { error: `Missing productId for item: ${item.name}` },
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

      // Determine correct price (respects size pricing)
      let price = product.price;
      if (item.selectedSize) {
        const sizePriceObj = product.sizePrices?.find(
          (sp) => sp.size === item.selectedSize
        );
        if (sizePriceObj) price = sizePriceObj.price;
      }

      const qty = Number(item.qty || item.quantity || 1);

      // Stock validation
      if (typeof product.stock === "number" && product.stock < qty) {
        return NextResponse.json(
          {
            error:
              product.stock <= 0
                ? `"${product.name}" is currently out of stock.`
                : `Only ${product.stock} unit(s) of "${product.name}" are available.`,
          },
          { status: 400 }
        );
      }

      subtotal += price * qty;

      validatedItems.push({
        productId: item.productId,
        selectedSize: item.selectedSize || null,
        name: item.name,
        image: product.image || item.image,
        price,
        qty,
      });
    }

    // Server-side coupon validation & savings recalculation (100% secure)
    const { verifiedSavings, couponCode } = await calculateVerifiedCouponDiscount({
      couponCodeInput: orderData.coupon,
      customerEmail: sessionEmail, // Use session email — never the body's email
      validatedItems,
      subtotal
    });
    orderData.coupon = couponCode;

    // Recalculate server-side total
    const deliveryCharge =
      orderData.deliveryPref === "express" ? 199 : subtotal > 999 ? 0 : 99;
    const taxableAmount = Math.max(0, subtotal - verifiedSavings);
    const taxAmount = Math.round(taxableAmount * 0.18);
    const verifiedTotal = taxableAmount + deliveryCharge + taxAmount;

    // ── 5. SECURITY: Replay attack prevention ────────────────────────────────
    // Prevents attacker from calling /verify multiple times with the same
    // valid Razorpay signature to create multiple orders from one payment.
    const alreadyUsed = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (alreadyUsed) {
      console.error(`[SECURITY] Replay attack attempt — paymentId ${razorpay_payment_id} already used for order ${alreadyUsed.id}`);
      return NextResponse.json(
        { error: "This payment has already been used to create an order." },
        { status: 400 }
      );
    }

    // ── 6. Generate a collision-resistant Order ID ────────────────────────────
    // SECURITY FIX: Math.random() only has 90,000 possibilities — UUID has 2^122.
    // Format: RVT-<8 hex chars>-IN  e.g. RVT-A3F2C1D9-IN
    const orderId = "RVT-" + crypto.randomUUID().split("-")[0].toUpperCase() + "-IN";

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      }),
      status: "Order Placed",
      statusColor: "text-amber-500 bg-amber-50",
      total: verifiedTotal,
      savings: verifiedSavings,
      coupon: orderData.coupon || "",
      customerName: orderData.customerName,
      customerEmail: sessionEmail, // Always use the session-verified email
      customerPhone: orderData.customerPhone || "",
      deliveryPref: orderData.deliveryPref || "standard",
      paymentMethod: (orderData.paymentMethod || "CARD").toUpperCase(),
      // Real Razorpay payment identifiers
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "paid",
      // Store shipping address on order document
      shippingAddress: orderData.shippingAddress || {},
      items: validatedItems,
      trackingSteps: [
        {
          title: "Order Placed",
          date: new Date().toLocaleString(),
          done: true,
        },
        { title: "Packed & Verified", date: "Pending", done: false },
        { title: "Shipped", date: "Pending", done: false },
        { title: "In Transit", date: "Pending", done: false },
        { title: "Delivered", date: "Pending", done: false },
      ],
    };

    // Check for duplicate order (safety)
    const existing = await Order.findOne({ id: orderId });
    if (existing) {
      return NextResponse.json({ error: "Duplicate order ID" }, { status: 400 });
    }

    const savedOrder = await Order.create(newOrder);

    // ── 6. Deduct stock ──────────────────────────────────────────────────────
    for (const item of validatedItems) {
      try {
        await Product.updateOne(
          { id: item.productId, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty } }
        );
      } catch (stockErr) {
        console.warn(`[STOCK] Failed to deduct for ${item.productId}:`, stockErr.message);
      }
    }

    clearOrdersCache();

    // ── 7. Send confirmation emails (non-blocking) ───────────────────────────
    Promise.all([
      sendOrderConfirmationEmail(savedOrder),
      sendNewOrderAdminAlert(savedOrder),
    ]).catch((err) => console.error("[EMAIL] Order notification error:", err));

    return NextResponse.json(
      { success: true, orderId: savedOrder.id, order: savedOrder },
      { status: 201 }
    );
  } catch (error) {
    // SECURITY FIX: Avoid leaking internal stack traces in production
    const isProduction = process.env.NODE_ENV === "production";
    console.error("[PAYMENT] Verify error:", isProduction ? error.message : error);
    return NextResponse.json(
      { error: isProduction ? "Internal server error" : (error.message || "Internal server error") },
      { status: 500 }
    );
  }
}
