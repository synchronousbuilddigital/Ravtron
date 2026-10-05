import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyAdmin, verifyUser, setSessionCookie, getSessionCookieOptions, parseSessionFromCookie } from "@/lib/auth";
import { cookies } from "next/headers";
import { getCachedUsers, setCachedUsers, clearUsersCache } from "@/lib/cache";
import { escapeRegex, sanitizeEmail, logSecurityEvent } from "@/lib/security";
import { verifyCsrfOrigin } from "@/lib/csrf";

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      logSecurityEvent("UNAUTHORIZED_GET_USERS_ATTEMPT");
      return NextResponse.json({ error: "Unauthorized access: Administrator role required" }, { status: 403 });
    }
    const cached = getCachedUsers();
    if (cached) {
      return NextResponse.json(cached);
    }
    await dbConnect();
    const users = await User.find({}).sort({ name: 1 }).lean();
    setCachedUsers(users);
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to retrieve users" : (error.message || "Failed to retrieve users") },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    const body = await request.json();
    const { email, role, name, active } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = sanitizeEmail(email);

    if (!(await verifyUser(cleanEmail))) {
      logSecurityEvent("UNAUTHORIZED_PUT_USER_ATTEMPT", { targetEmail: cleanEmail });
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if ((role !== undefined || active !== undefined) && !(await verifyAdmin())) {
      logSecurityEvent("UNAUTHORIZED_ROLE_CHANGE_ATTEMPT", { targetEmail: cleanEmail });
      return NextResponse.json({ error: "Unauthorized: Administrator privileges required to change role or active status" }, { status: 403 });
    }

    await dbConnect();
    const updateFields = {};
    if (role !== undefined) updateFields.role = role;
    if (name !== undefined) updateFields.name = name;
    if (active !== undefined) updateFields.active = active;

    const safeRegex = new RegExp(`^${escapeRegex(cleanEmail)}$`, "i");

    const updatedUser = await User.findOneAndUpdate(
      { email: { $regex: safeRegex } },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cookieOptions = getSessionCookieOptions(request);

    // Update session cookie if the user is updating their own profile
    const cookieStore = await cookies();
    const rawCookieValue = cookieStore.get("ravtron_session")?.value;
    if (rawCookieValue) {
      try {
        const session = parseSessionFromCookie(rawCookieValue);
        if (session && session.email.toLowerCase() === cleanEmail) {
          const sessionUser = {
            name: updatedUser.name,
            email: updatedUser.email,
            phone: "",
            avatar: "",
            joinDate: updatedUser.joinDate,
            role: updatedUser.role,
            isLoggedIn: true
          };
          setSessionCookie(cookieStore, sessionUser, cookieOptions);
        }
      } catch (e) {
        console.error("Failed to update session cookie in PUT /api/users", e);
      }
    }

    clearUsersCache();
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /api/users error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to update user" : (error.message || "Failed to update user") },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const csrf = verifyCsrfOrigin(request);
    if (!csrf.ok) return csrf.response;
    await dbConnect();
    const body = await request.json();
    const { name, email, role, joinDate } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const cleanEmail = sanitizeEmail(email);
    const safeRegex = new RegExp(`^${escapeRegex(cleanEmail)}$`, "i");

    const existing = await User.findOne({ email: { $regex: safeRegex } });
    const userToSession = existing || await User.create({
      name,
      email: cleanEmail,
      role: "Customer", // SEC-009: Role is ALWAYS forced to "Customer" — never trust client input
      joinDate: joinDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      active: true
    });

    const sessionUser = {
      name: userToSession.name,
      email: userToSession.email,
      phone: "",
      avatar: "",
      joinDate: userToSession.joinDate,
      role: userToSession.role,
      isLoggedIn: true
    };

    const cookieStore = await cookies();
    setSessionCookie(cookieStore, sessionUser, getSessionCookieOptions(request));

    clearUsersCache();
    return NextResponse.json(userToSession, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to create user" : (error.message || "Failed to create user") },
      { status: 500 }
    );
  }
}
