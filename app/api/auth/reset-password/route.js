import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { escapeRegex, sanitizeEmail, hashPassword, comparePassword, logSecurityEvent } from "@/lib/security";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = await rateLimit(`reset_pass_${clientIp}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP code, and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    const cleanEmail = sanitizeEmail(email);
    const cleanOtp = String(otp).trim();

    await dbConnect();

    // Retrieve pending OTP document for reset
    const otpRecord = await OTP.findOne({ email: cleanEmail, type: "reset" });

    if (!otpRecord) {
      logSecurityEvent("RESET_OTP_NOT_FOUND", { email: cleanEmail, ip: clientIp });
      return NextResponse.json(
        { error: "No pending password reset found. Please request a new reset code." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await OTP.deleteOne({ _id: otpRecord._id });
      logSecurityEvent("RESET_OTP_EXPIRED", { email: cleanEmail, ip: clientIp });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify OTP — compare input against bcrypt hash stored in DB
    const isOtpValid = await comparePassword(cleanOtp, otpRecord.otp);
    if (!isOtpValid) {
      logSecurityEvent("RESET_OTP_MISMATCH", { email: cleanEmail, ip: clientIp });
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    // OTP is valid! Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    const adminEnvEmail = sanitizeEmail(process.env.ADMIN_EMAIL || "officerequirementsgurgaon@gmail.com");
    const adminEnvName = process.env.ADMIN_NAME || "Ravtron";
    const isAdminReset = cleanEmail === adminEnvEmail;

    const safeRegex = new RegExp(`^${escapeRegex(cleanEmail)}$`, "i");
    let targetUser = await User.findOne({ email: { $regex: safeRegex } });

    if (!targetUser && isAdminReset) {
      // Auto-provision admin in DB with newly reset password
      targetUser = await User.create({
        name: adminEnvName,
        email: adminEnvEmail,
        password: hashedPassword,
        role: "Administrator",
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        active: true,
        emailVerified: true
      });
    } else if (targetUser) {
      targetUser.password = hashedPassword;
      targetUser.active = true;
      targetUser.emailVerified = true;
      await targetUser.save();
    } else {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // Delete used reset OTP document
    await OTP.deleteOne({ _id: otpRecord._id });

    logSecurityEvent("PASSWORD_RESET_SUCCESS", { email: cleanEmail, ip: clientIp });

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password."
    });

  } catch (error) {
    logSecurityEvent("RESET_PASSWORD_SERVER_ERROR", { error: error.message });
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to reset password. Please try again." : (error.message || "Failed to reset password.") },
      { status: 500 }
    );
  }
}
