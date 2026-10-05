import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { escapeRegex, sanitizeEmail, hashPassword, logSecurityEvent, verifyBotProtection } from "@/lib/security";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sendPasswordResetOTPEmail } from "@/lib/email";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = rateLimit(`forgot_pass_${clientIp}`, 3, 15 * 60 * 1000); // 3 attempts per 15 mins
    if (!rateCheck.success) {
      logSecurityEvent("FORGOT_PASSWORD_RATE_LIMIT_EXCEEDED", { ip: clientIp });
      return NextResponse.json(
        { error: "Too many password reset requests. Please wait 15 minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const botCheck = verifyBotProtection(body);
    if (botCheck.isBot) {
      return NextResponse.json({ error: "Invalid submission detected." }, { status: 400 });
    }

    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = sanitizeEmail(email);

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address (e.g., name@example.com)." },
        { status: 400 }
      );
    }

    await dbConnect();

    const adminEnvEmail = sanitizeEmail(process.env.ADMIN_EMAIL || "officerequirementsgurgaon@gmail.com");
    const adminEnvName = process.env.ADMIN_NAME || "Ravtron";

    const safeRegex = new RegExp(`^${escapeRegex(cleanEmail)}$`, "i");
    let existingUser = await User.findOne({ email: { $regex: safeRegex } });

    const isAdminReset = cleanEmail === adminEnvEmail;

    if (!existingUser && !isAdminReset) {
      logSecurityEvent("FORGOT_PASSWORD_UNKNOWN_EMAIL", { email: cleanEmail, ip: clientIp });
      return NextResponse.json(
        { error: "No account found with this email address. Please sign up." },
        { status: 404 }
      );
    }

    const userName = existingUser?.name || (isAdminReset ? adminEnvName : "Valued User");

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await hashPassword(otp); // SECURITY: store bcrypt hash, not plain OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Clear old reset OTPs for this email and store new one
    await OTP.deleteMany({ email: cleanEmail, type: "reset" });
    await OTP.create({
      email: cleanEmail,
      otp: hashedOtp, // bcrypt hash of OTP
      name: userName,
      type: "reset",
      expiresAt
    });

    const emailResult = await sendPasswordResetOTPEmail({
      email: cleanEmail,
      name: userName,
      otp
    });

    logSecurityEvent("PASSWORD_RESET_OTP_SENT", { email: cleanEmail, ip: clientIp, simulated: !!emailResult.simulated });

    return NextResponse.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${cleanEmail}.`
    });

  } catch (error) {
    logSecurityEvent("FORGOT_PASSWORD_SERVER_ERROR", { error: error.message });
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to process request. Please try again later." : (error.message || "Failed to process request.") },
      { status: 500 }
    );
  }
}
