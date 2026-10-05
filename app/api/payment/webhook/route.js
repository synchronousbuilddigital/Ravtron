import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

// Razorpay sends webhook events server-to-server.
// This is a backup confirmation path (in case the user's browser closes after payment).
// Must be registered in the Razorpay Dashboard under: Settings > Webhooks
// URL: https://yourdomain.com/api/payment/webhook

export async function POST(request) {
  try {
    const rawBody = await request.text(); // Must read as raw text for signature verification
    const razorpaySignature = request.headers.get("x-razorpay-signature");

    if (!razorpaySignature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    // ── 1. Verify webhook signature ──────────────────────────────────────────
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[WEBHOOK] RAZORPAY_WEBHOOK_SECRET not set in environment.");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error("[WEBHOOK] Invalid signature — possible spoofed request");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // ── 2. Parse the event payload ───────────────────────────────────────────
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;

    if (!paymentEntity) {
      return NextResponse.json({ received: true }); // Ignore irrelevant events
    }

    await dbConnect();

    // ── 3. Handle payment.captured — mark order as paid ─────────────────────
    if (eventType === "payment.captured") {
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (razorpayOrderId) {
        // SECURITY FIX (Issue #5): Idempotency guard.
        // Razorpay retries webhooks on failure — this prevents double-processing
        // if the same payment.captured event arrives more than once.
        const existingOrder = await Order.findOne({ razorpayOrderId }).lean();

        if (existingOrder && existingOrder.paymentStatus === "paid") {
          // Already processed — acknowledge without re-applying changes
          console.log(`[WEBHOOK] Already processed — skipping duplicate for razorpayOrderId: ${razorpayOrderId}`);
        } else {
          const updated = await Order.findOneAndUpdate(
            { razorpayOrderId },
            {
              razorpayPaymentId,
              paymentStatus: "paid",
              status: "Order Placed",
            },
            { new: true }
          );

          if (updated) {
            console.log(`[WEBHOOK] Order marked as paid: ${updated.id}`);
          } else {
            console.warn(`[WEBHOOK] No matching order found for razorpayOrderId: ${razorpayOrderId}`);
          }
        }
      }
    }

    // ── 4. Handle payment.failed — mark order as failed ─────────────────────
    if (eventType === "payment.failed") {
      const razorpayOrderId = paymentEntity.order_id;

      if (razorpayOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId, paymentStatus: "pending" }, // Only update if still pending
          { paymentStatus: "failed" }
        );
        console.log(`[WEBHOOK] Payment failed for razorpayOrderId: ${razorpayOrderId}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[WEBHOOK] Error processing webhook:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Webhook processing failed" : (error.message || "Webhook processing failed") },
      { status: 500 }
    );
  }
}
