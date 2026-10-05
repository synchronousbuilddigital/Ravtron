import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { verifyUser, verifyAdmin } from "@/lib/auth";
import { clearOrdersCache } from "@/lib/cache";

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const order = await Order.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security check: Only the customer who owns the order or an Administrator can cancel it
    const isOwner = await verifyUser(order.customerEmail);
    const isAdmin = await verifyAdmin();
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized access: Mismatching session" }, { status: 403 });
    }

    // Business logic: Cannot cancel already cancelled orders
    if (order.status === "Cancelled") {
      return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
    }

    // Cancellation window: user can only cancel within 24 hours of placement
    if (!isAdmin) {
      const orderCreatedAt = order.createdAt ? new Date(order.createdAt).getTime() : new Date(order.date).getTime();
      if (!isNaN(orderCreatedAt)) {
        const hoursElapsed = (Date.now() - orderCreatedAt) / (1000 * 60 * 60);
        if (hoursElapsed > 24) {
          return NextResponse.json(
            { error: "Orders can only be cancelled within 24 hours of placement." },
            { status: 400 }
          );
        }
      }
    }

    // Restore product stock on cancellation
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.productId && item.qty) {
          try {
            await Product.updateOne(
              { id: item.productId },
              { $inc: { stock: item.qty } }
            );
          } catch (stockErr) {
            console.warn(`Failed to restore stock for ${item.productId}:`, stockErr.message);
          }
        }
      }
    }

    order.status = "Cancelled";
    order.statusColor = "text-rose-500 bg-rose-50";

    // Mark all unfinished tracking steps as not done, and append a step for cancellation
    const formattedSteps = order.trackingSteps.map(step => {
      if (step.done) return step;
      return { title: step.title, date: step.date, done: false };
    });

    formattedSteps.push({
      title: "Order Cancelled",
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      done: true
    });

    order.trackingSteps = formattedSteps;
    await order.save();
    clearOrdersCache();

    return NextResponse.json(order);
  } catch (error) {
    console.error("POST /api/orders/[id]/cancel error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to cancel order" : (error.message || "Failed to cancel order") },
      { status: 500 }
    );
  }
}
