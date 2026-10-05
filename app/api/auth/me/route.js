import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.isLoggedIn) {
      return NextResponse.json({ isLoggedIn: false, user: null });
    }
    return NextResponse.json({ isLoggedIn: true, user: session });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { isLoggedIn: false, user: null, error: process.env.NODE_ENV === "production" ? "Authentication check failed" : (error.message || "Authentication check failed") },
      { status: 500 }
    );
  }
}
