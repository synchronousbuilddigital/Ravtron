import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { cookies } from "next/headers";
import { escapeRegex, sanitizeEmail, logSecurityEvent, comparePassword, hashPassword, verifyBotProtection } from "@/lib/security";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { setSessionCookie, getSessionCookieOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = rateLimit(`login_${clientIp}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      logSecurityEvent("LOGIN_RATE_LIMIT_EXCEEDED", { ip: clientIp });
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 1 minute before trying again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await request.json();

    // Check honeypot / bot protection
    const botCheck = verifyBotProtection(body);
    if (botCheck.isBot) {
      return NextResponse.json({ error: "Invalid submission detected." }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const inputEmail = sanitizeEmail(email);
    const safeRegex = new RegExp(`^${escapeRegex(inputEmail)}$`, "i");

    const cookieOptions = getSessionCookieOptions(request);


    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      logSecurityEvent("MISSING_ADMIN_ENV_VARS", { ip: clientIp });
      console.error("FATAL: ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables.");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }
    const adminEnvEmail = sanitizeEmail(process.env.ADMIN_EMAIL);
    const adminEnvPassword = process.env.ADMIN_PASSWORD;
    const adminEnvName = process.env.ADMIN_NAME || "Administrator";

    let existingUser = null;
    try {
      await dbConnect();
      existingUser = await User.findOne({ email: { $regex: safeRegex } }).select("+password");
    } catch (dbErr) {
      console.warn("MongoDB connection notice during login:", dbErr.message);
    }

    const isAdminLogin = inputEmail === adminEnvEmail || (existingUser && existingUser.role === "Administrator");

    if (isAdminLogin) {
      // Validate Admin Password strictly against env configuration or bcrypt hash if stored
      let isValidAdminPass = password === adminEnvPassword;
      if (!isValidAdminPass && existingUser && existingUser.password) {
        isValidAdminPass = await comparePassword(password, existingUser.password);
      }

      if (!isValidAdminPass) {
        logSecurityEvent("ADMIN_LOGIN_FAILED", { email: inputEmail, ip: clientIp });
        return NextResponse.json({ error: "Invalid administrative security credentials." }, { status: 401 });
      }

      let adminUser = existingUser;

      // Auto-provision configured environment admin if missing in database
      if (!adminUser && inputEmail === adminEnvEmail) {
        try {
          const hashedPassword = await hashPassword(adminEnvPassword);
          adminUser = await User.create({
            name: adminEnvName,
            email: adminEnvEmail,
            password: hashedPassword,
            role: "Administrator",
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            active: true
          });
        } catch (e) {
          console.warn("Failed to persist admin to MongoDB during login:", e.message);
        }
      }

      if (adminUser && adminUser.active === false) {
        logSecurityEvent("ADMIN_LOGIN_DISABLED_PROFILE", { email: inputEmail });
        return NextResponse.json({ error: "Access denied. This administrative profile has been disabled." }, { status: 403 });
      }

      const sessionUser = {
        name: adminUser?.name || adminEnvName,
        email: adminUser?.email || inputEmail,
        phone: "",
        avatar: "",
        joinDate: adminUser?.joinDate || "June 2026",
        role: "Administrator",
        isLoggedIn: true
      };

      const cookieStore = await cookies();
      setSessionCookie(cookieStore, sessionUser, cookieOptions);

      logSecurityEvent("ADMIN_LOGIN_SUCCESS", { email: inputEmail, ip: clientIp });
      return NextResponse.json({ success: true, user: sessionUser });

    } else {
      // Customer Login
      let clientUser = existingUser;

      if (!clientUser) {
        logSecurityEvent("CUSTOMER_LOGIN_USER_NOT_FOUND", { email: inputEmail, ip: clientIp });
        return NextResponse.json({ error: "No account found with this email. Please create an account." }, { status: 404 });
      }

      if (clientUser.password) {
        const isValid = await comparePassword(password, clientUser.password);
        if (!isValid) {
          logSecurityEvent("CUSTOMER_LOGIN_FAILED", { email: inputEmail, ip: clientIp });
          return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }
      } else {
        logSecurityEvent("CUSTOMER_LOGIN_NO_PASSWORD", { email: inputEmail, ip: clientIp });
        return NextResponse.json(
          { error: "This account was created via Google or does not have a password set. Please log in with Google or reset your password." },
          { status: 400 }
        );
      }

      if (clientUser && clientUser.active === false) {
        logSecurityEvent("CUSTOMER_LOGIN_DISABLED_PROFILE", { email: inputEmail });
        return NextResponse.json({ error: "Access denied. Your profile has been deactivated. Please contact support." }, { status: 403 });
      }

      const defaultClientName = inputEmail.split("@")[0].split(".").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") || "RAVTRON Client";
      const sessionUser = {
        name: clientUser?.name || defaultClientName,
        email: clientUser?.email || inputEmail,
        phone: "",
        avatar: "",
        joinDate: clientUser?.joinDate || "June 2026",
        role: "Customer",
        isLoggedIn: true
      };

      const cookieStore = await cookies();
      setSessionCookie(cookieStore, sessionUser, cookieOptions);

      logSecurityEvent("CUSTOMER_LOGIN_SUCCESS", { email: inputEmail, ip: clientIp });
      return NextResponse.json({ success: true, user: sessionUser });
    }
  } catch (error) {
    logSecurityEvent("LOGIN_SERVER_ERROR", { error: error.message });
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "An unexpected error occurred. Please try again." : (error.message || "An unexpected error occurred.") },
      { status: 500 }
    );
  }
}

