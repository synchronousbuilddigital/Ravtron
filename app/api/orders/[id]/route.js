import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { verifyAdmin, verifyUser } from "@/lib/auth";
import { clearOrdersCache } from "@/lib/cache";
import { sendShipmentNotificationEmail } from "@/lib/email";
import { verifyCsrfOrigin } from "@/lib/csrf";

export async function PUT(request, { params }) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // SEC-008: Strict field whitelist — prevents mass assignment on sensitive fields
    // Fields like total, items, customerEmail, customerName, id are NEVER overwritable after checkout.
    const allowedUpdates = {};

    if (body.status !== undefined)                  allowedUpdates.status = String(body.status).trim();
    if (body.statusColor !== undefined)             allowedUpdates.statusColor = String(body.statusColor).trim();
    if (body.trackingSteps !== undefined)           allowedUpdates.trackingSteps = body.trackingSteps;
    if (body.trackingId !== undefined)              allowedUpdates.trackingId = String(body.trackingId).trim();
    if (body.courier !== undefined)                 allowedUpdates.courier = String(body.courier).trim();
    if (body.courierName !== undefined)             allowedUpdates.courierName = String(body.courierName).trim();
    if (body.trackingUrl !== undefined)             allowedUpdates.trackingUrl = String(body.trackingUrl).trim();
    if (body.estimatedDelivery !== undefined)       allowedUpdates.estimatedDelivery = String(body.estimatedDelivery).trim();
    if (body.dispatchNote !== undefined)            allowedUpdates.dispatchNote = String(body.dispatchNote).trim();
    if (body.dispatchedAt !== undefined)            allowedUpdates.dispatchedAt = String(body.dispatchedAt).trim();
    if (body.adminNote !== undefined)               allowedUpdates.adminNote = String(body.adminNote).trim();

    // Ensure courier field sync
    if (allowedUpdates.courier && !allowedUpdates.courierName) {
      allowedUpdates.courierName = allowedUpdates.courier;
    } else if (allowedUpdates.courierName && !allowedUpdates.courier) {
      allowedUpdates.courier = allowedUpdates.courierName;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { id },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    clearOrdersCache();

    // Trigger shipment tracking email if requested or if status is set/updated to Shipped
    let emailResult = null;
    const shouldSendEmail =
      body.sendEmailNotification === true ||
      body.sendTrackingEmail === true ||
      (body.status === "Shipped" && body.sendEmailNotification !== false);

    if (shouldSendEmail) {
      const courier = allowedUpdates.courier || allowedUpdates.courierName || updatedOrder.courier || updatedOrder.courierName || "Express Courier";
      const trackingId = allowedUpdates.trackingId || updatedOrder.trackingId || updatedOrder.id;
      const trackingUrl = allowedUpdates.trackingUrl || updatedOrder.trackingUrl || "";
      const dispatchNote = allowedUpdates.dispatchNote || updatedOrder.dispatchNote || "";
      const estimatedDelivery = allowedUpdates.estimatedDelivery || updatedOrder.estimatedDelivery || "";

      try {
        emailResult = await sendShipmentNotificationEmail(
          updatedOrder,
          courier,
          trackingId,
          trackingUrl,
          dispatchNote,
          estimatedDelivery
        );

        if (emailResult?.success) {
          const emailSentTimestamp = new Date().toLocaleString("en-IN");
          await Order.updateOne(
            { id },
            { $set: { lastTrackingEmailSentAt: emailSentTimestamp } }
          );
          updatedOrder.lastTrackingEmailSentAt = emailSentTimestamp;
        }
      } catch (err) {
        console.error("Shipment notification email error:", err);
      }
    }

    const resData = updatedOrder.toObject ? updatedOrder.toObject() : updatedOrder;
    return NextResponse.json({
      ...resData,
      emailSent: emailResult?.success ?? false,
      emailResult: emailResult || null
    });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to update order" : (error.message || "Failed to update order") },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const order = await Order.findOne({ id });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!(await verifyUser(order.customerEmail))) {
      return NextResponse.json({ error: "Unauthorized access: Mismatching session" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to retrieve order" : (error.message || "Failed to retrieve order") },
      { status: 500 }
    );
  }
}
