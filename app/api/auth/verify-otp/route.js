import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { cookies } from "next/headers";
import { sanitizeEmail, logSecurityEvent, comparePassword } from "@/lib/security";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { setSessionCookie, getSessionCookieOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = rateLimit(`verify_otp_${clientIp}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const cleanEmail = sanitizeEmail(email);
    const cleanOtp = String(otp).trim();

    await dbConnect();

    // Retrieve pending registration OTP document
    const otpRecord = await OTP.findOne({ email: cleanEmail, type: { $ne: "reset" } });

    if (!otpRecord) {
      logSecurityEvent("OTP_VERIFY_NOT_FOUND", { email: cleanEmail, ip: clientIp });
      return NextResponse.json(
        { error: "No pending verification found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await OTP.deleteOne({ _id: otpRecord._id });
      logSecurityEvent("OTP_EXPIRED", { email: cleanEmail, ip: clientIp });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify OTP — compare against bcrypt hash stored in DB
    const isOtpValid = await comparePassword(cleanOtp, otpRecord.otp);
    if (!isOtpValid) {
      logSecurityEvent("OTP_MISMATCH", { email: cleanEmail, ip: clientIp });
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    // OTP is valid! Create verified user in User collection
    const newUser = await User.create({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password, // Pre-hashed in send-otp
      role: "Customer",
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      active: true,
      emailVerified: true
    });

    // Delete used OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Set secure session cookie
    const sessionUser = {
      name: newUser.name,
      email: newUser.email,
      phone: otpRecord.phone || "",
      avatar: "",
      joinDate: newUser.joinDate,
      role: newUser.role,
      isLoggedIn: true
    };

    const cookieStore = await cookies();
    setSessionCookie(cookieStore, sessionUser, getSessionCookieOptions(request));

    logSecurityEvent("USER_REGISTERED_SUCCESS", { email: cleanEmail, ip: clientIp });

    return NextResponse.json({
      success: true,
      user: sessionUser
    });

  } catch (error) {
    logSecurityEvent("VERIFY_OTP_ERROR", { error: error.message });
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to verify code. Please try again." : (error.message || "Failed to verify code.") },
      { status: 500 }
    );
  }
}
