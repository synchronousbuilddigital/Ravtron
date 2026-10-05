import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "ravtron_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
      sameSite: "lax"
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to logout" : (error.message || "Failed to logout") },
      { status: 500 }
    );
  }
}
