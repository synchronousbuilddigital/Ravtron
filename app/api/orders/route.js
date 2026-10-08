import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { verifyAdmin, verifyUser } from "@/lib/auth";
import { getCachedOrders, setCachedOrders } from "@/lib/cache";
import { verifyCsrfOrigin } from "@/lib/csrf";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      if (!(await verifyUser(email))) {
        return NextResponse.json({ error: "Unauthorized access: Mismatching session" }, { status: 403 });
      }
    } else {
      if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
      }
      const cached = getCachedOrders();
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    await dbConnect();
    const query = email ? { customerEmail: email } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    if (!email) {
      setCachedOrders(orders);
    }
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to retrieve orders" : (error.message || "Failed to retrieve orders") },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const csrf = verifyCsrfOrigin(request);
  if (!csrf.ok) return csrf.response;

  return NextResponse.json(
    { error: "Cash on Delivery is not supported. All orders must be placed and paid securely online via Razorpay." },
    { status: 400 }
  );
}
