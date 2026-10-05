import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { verifyUser, verifyAdmin } from "@/lib/auth";

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

    // Business logic: Cannot cancel shipped, delivered, or already cancelled orders
    if (order.status === "Cancelled") {
      return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
    }
    if (order.status === "Shipped" || order.status === "Delivered") {
      return NextResponse.json({ error: `Order cannot be cancelled because its status is already ${order.status}` }, { status: 400 });
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

    return NextResponse.json(order);
  } catch (error) {
    console.error("POST /api/orders/[id]/cancel error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to cancel order" : (error.message || "Failed to cancel order") },
      { status: 500 }
    );
  }
}
