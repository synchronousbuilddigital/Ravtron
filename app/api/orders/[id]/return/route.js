import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { verifyUser } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const order = await Order.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isOwner = await verifyUser(order.customerEmail);
    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized access: Mismatching session" }, { status: 403 });
    }

    if (order.status === "Cancelled") {
      return NextResponse.json({ error: "Cannot return a cancelled order" }, { status: 400 });
    }

    const reason = body.reason || "Defective / Damaged";
    const comments = body.comments || "";

    order.status = "Return Requested";
    order.statusColor = "text-purple-600 bg-purple-50";
    order.returnRequest = {
      reason,
      comments,
      requestedAt: new Date().toLocaleString(),
      status: "Pending"
    };

    const hasReturnStep = order.trackingSteps.some((s) => s.title === "Return Requested");
    if (!hasReturnStep) {
      order.trackingSteps.push({
        title: "Return Requested",
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        done: true
      });
    }

    await order.save();

    return NextResponse.json(order);
  } catch (error) {
    console.error("POST /api/orders/[id]/return error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to submit return request" : (error.message || "Failed to submit return request") },
      { status: 500 }
    );
  }
}
