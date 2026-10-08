import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { clearOrdersCache } from "@/lib/cache";
import { sendOrderConfirmationEmail, sendNewOrderAdminAlert } from "@/lib/email";

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

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const receivedBuf = Buffer.from(razorpaySignature, "utf8");
    const isSignatureValid = expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isSignatureValid) {
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

    // ── 3. Handle payment.captured — mark existing order or create backup order ──
    if (eventType === "payment.captured") {
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (razorpayOrderId) {
        const existingOrder = await Order.findOne({
          $or: [{ razorpayOrderId }, { razorpayPaymentId }]
        });

        if (existingOrder) {
          if (existingOrder.paymentStatus !== "paid") {
            await Order.updateOne(
              { _id: existingOrder._id },
              {
                razorpayPaymentId,
                paymentStatus: "paid",
                status: "Order Placed",
              }
            );
            clearOrdersCache();
            console.log(`[WEBHOOK] Existing order marked as paid: ${existingOrder.id}`);
          } else {
            console.log(`[WEBHOOK] Already processed — skipping duplicate for order: ${existingOrder.id}`);
          }
        } else {
          // ── 3b. BACKUP ORDER CREATION (User disconnected before /verify completed) ──
          console.warn(`[WEBHOOK] No order found for razorpayOrderId: ${razorpayOrderId}. Auto-creating backup order...`);

          const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();
          const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
          let rzpOrder = null;

          if (razorpayKeyId && razorpayKeySecret) {
            try {
              const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
              rzpOrder = await razorpay.orders.fetch(razorpayOrderId);
            } catch (rzpErr) {
              console.error("[WEBHOOK] Error fetching Razorpay order metadata:", rzpErr.message);
            }
          }

          const notes = rzpOrder?.notes || paymentEntity.notes || {};
          const customerEmail = notes.customerEmail || paymentEntity.email || "support@ravtron.in";
          const customerName = notes.customerName || paymentEntity.notes?.customerName || "Valued Customer";
          const customerPhone = notes.customerPhone || paymentEntity.contact || "";
          const paidAmount = Number(paymentEntity.amount ? paymentEntity.amount / 100 : (rzpOrder?.amount ? rzpOrder.amount / 100 : 0));

          // Reconstruct order items from notes.itemsSummary or DB lookup
          let reconstructedItems = [];
          if (notes.itemsSummary) {
            try {
              const parsedSummary = JSON.parse(notes.itemsSummary);
              if (Array.isArray(parsedSummary)) {
                for (const it of parsedSummary) {
                  const product = await Product.findOne({ id: it.id });
                  if (product) {
                    let price = Number(product.price) || 0;
                    if (it.sz && Array.isArray(product.sizePrices)) {
                      const sp = product.sizePrices.find(s => s.size === it.sz);
                      if (sp && Number(sp.price) > 0) price = Number(sp.price);
                    }
                    reconstructedItems.push({
                      name: product.name,
                      image: product.image || "/logo.png",
                      price: price,
                      qty: Number(it.q) || 1,
                      productId: product.id,
                      selectedSize: it.sz || undefined
                    });
                  }
                }
              }
            } catch (parseErr) {
              console.warn("[WEBHOOK] Failed to parse itemsSummary notes:", parseErr.message);
            }
          }

          // Fallback item if line items could not be parsed
          if (reconstructedItems.length === 0) {
            reconstructedItems.push({
              name: "RAVTRON® Order (Auto-Recovered)",
              image: "/logo.png",
              price: paidAmount,
              qty: 1,
              productId: "recovered"
            });
          }

          // Generate Collision-Proof Timestamp + Cryptographic UUID Order ID
          const timestampPart = Date.now().toString(36).toUpperCase();
          const randomHexPart = crypto.randomUUID().split("-")[0].toUpperCase();
          const orderId = `RVT-${timestampPart}-${randomHexPart}-IN`;

          const newBackupOrder = {
            id: orderId,
            date: new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "2-digit",
              year: "numeric",
            }),
            status: "Order Placed",
            statusColor: "text-amber-500 bg-amber-50",
            total: paidAmount,
            savings: 0,
            coupon: notes.coupon || "",
            customerName,
            customerEmail,
            customerPhone,
            deliveryPref: notes.deliveryPref || "standard",
            paymentMethod: (paymentEntity.method || "ONLINE").toUpperCase(),
            razorpayOrderId,
            razorpayPaymentId,
            paymentStatus: "paid",
            shippingAddress: {
              street: notes.shippingStreet || "",
              city: notes.shippingCity || "",
              state: notes.shippingState || "",
              zip: notes.shippingZip || "",
              country: "India"
            },
            items: reconstructedItems,
            trackingSteps: [
              { title: "Order Placed", date: new Date().toLocaleString(), done: true },
              { title: "Packed & Verified", date: "Pending", done: false },
              { title: "Shipped", date: "Pending", done: false },
              { title: "In Transit", date: "Pending", done: false },
              { title: "Delivered", date: "Pending", done: false }
            ]
          };

          let savedOrder;
          try {
            savedOrder = await Order.create(newBackupOrder);
            console.log(`[WEBHOOK] Successfully created backup order ${savedOrder.id} for payment ${razorpayPaymentId}`);
          } catch (createErr) {
            // Check for MongoDB duplicate-key error (11000) on unique constraints (razorpayOrderId / razorpayPaymentId / id)
            if (createErr.code === 11000 || (createErr.message && createErr.message.includes("E11000"))) {
              console.warn(`[WEBHOOK IDEMPOTENCY] Concurrent duplicate order creation race intercepted for razorpayOrderId: ${razorpayOrderId}, paymentId: ${razorpayPaymentId}. Acknowledging without duplicate side effects.`);
              // Fetch the winning order record that was created concurrently
              const existingWinner = await Order.findOne({
                $or: [{ razorpayOrderId }, { razorpayPaymentId }]
              });
              if (existingWinner && existingWinner.paymentStatus !== "paid") {
                await Order.updateOne(
                  { _id: existingWinner._id },
                  { razorpayPaymentId, paymentStatus: "paid", status: "Order Placed" }
                );
                clearOrdersCache();
              }
              // Immediately exit without performing duplicate inventory deduction or duplicate email notifications
              return NextResponse.json({ received: true, duplicateHandled: true }, { status: 200 });
            }
            // Rethrow unexpected database errors to be handled by the outer error handler
            throw createErr;
          }

          // Deduct stock for reconstructed items (executes ONLY on the winning successful order creation)
          for (const item of reconstructedItems) {
            if (item.productId && item.productId !== "recovered") {
              try {
                await Product.updateOne(
                  { id: item.productId, stock: { $gte: item.qty } },
                  { $inc: { stock: -item.qty } }
                );
              } catch (stockErr) {
                console.warn(`[WEBHOOK STOCK] Failed to deduct stock for ${item.productId}:`, stockErr.message);
              }
            }
          }

          clearOrdersCache();

          // Send confirmation & alert emails (non-blocking, executes ONLY once)
          Promise.all([
            sendOrderConfirmationEmail(savedOrder),
            sendNewOrderAdminAlert(savedOrder),
          ]).catch((err) => console.error("[WEBHOOK EMAIL] Notification error:", err));
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
