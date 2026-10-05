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

    if (body.status !== undefined)           allowedUpdates.status = body.status;
    if (body.statusColor !== undefined)      allowedUpdates.statusColor = body.statusColor;
    if (body.trackingSteps !== undefined)    allowedUpdates.trackingSteps = body.trackingSteps;
    if (body.trackingId !== undefined)       allowedUpdates.trackingId = body.trackingId;
    if (body.courier !== undefined)          allowedUpdates.courier = body.courier;
    if (body.adminNote !== undefined)        allowedUpdates.adminNote = body.adminNote;

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

    // Trigger shipment notification email if order status was set to Shipped
    if (body.status === "Shipped") {
      sendShipmentNotificationEmail(updatedOrder)
        .catch((err) => console.error("Shipment notification email error:", err));
    }

    return NextResponse.json(updatedOrder);
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
