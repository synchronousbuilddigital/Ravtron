import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import { escapeRegex, sanitizeEmail, logSecurityEvent, isAllowedDomain } from "@/lib/security";
import { setSessionCookie, getSessionCookieOptions } from "@/lib/auth";

function getGoogleOAuthClient() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.PUBLIC_GOOGLE_CLIENT_ID || "dummy-client-id";
  return new OAuth2Client(clientId);
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { credential, access_token } = body;

    let email = "";
    let name = "";
    let picture = "";

    const client = getGoogleOAuthClient();
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.PUBLIC_GOOGLE_CLIENT_ID;

    if (credential) {
      // Verify Google ID Token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        logSecurityEvent("GOOGLE_AUTH_INVALID_PAYLOAD");
        return NextResponse.json({ error: "Invalid Google credential token." }, { status: 400 });
      }
      email = payload.email;
      name = payload.name || payload.given_name || "RAVTRON User";
      picture = payload.picture || "";
    } else if (access_token) {
      // Fetch user profile from Google UserInfo API with domain safety checks (SSRF Prevention)
      try {
        const userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
        if (!isAllowedDomain(userInfoUrl)) {
          throw new Error("Target domain is not permitted.");
        }

        let res = await fetch(userInfoUrl, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!res.ok) {
          const fallbackUrl = `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${encodeURIComponent(access_token)}`;
          if (isAllowedDomain(fallbackUrl)) {
            res = await fetch(fallbackUrl);
          }
        }

        if (res.ok) {
          const profile = await res.json();
          email = profile.email;
          name = profile.name || profile.given_name || "RAVTRON User";
          picture = profile.picture || "";
        } else {
          // Tokeninfo fallback
          const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(access_token)}`;
          if (isAllowedDomain(tokenInfoUrl)) {
            const tokenInfoRes = await fetch(tokenInfoUrl);
            if (tokenInfoRes.ok) {
              const tokenInfo = await tokenInfoRes.json();
              email = tokenInfo.email;
              name = tokenInfo.email ? tokenInfo.email.split("@")[0] : "RAVTRON User";
            }
          }
        }
      } catch (fetchErr) {
        logSecurityEvent("GOOGLE_USERINFO_FETCH_FAILED", { error: fetchErr.message });
      }
    } else {
      return NextResponse.json({ error: "Google credential or access token is required." }, { status: 400 });
    }

    if (!email) {
      logSecurityEvent("GOOGLE_AUTH_MISSING_EMAIL");
      return NextResponse.json({ error: "Could not retrieve email from Google account. Please try again." }, { status: 400 });
    }

    const inputEmail = sanitizeEmail(email);
    const safeRegex = new RegExp(`^${escapeRegex(inputEmail)}$`, "i");

    // SEC-011: No hardcoded fallback credentials — must be set via environment variables
    const adminEnvEmail = process.env.ADMIN_EMAIL ? sanitizeEmail(process.env.ADMIN_EMAIL) : null;
    const adminEnvName = process.env.ADMIN_NAME || "Administrator";

    // Search for existing user in MongoDB
    let existingUser = await User.findOne({ email: { $regex: safeRegex } });

    const isAdmin = inputEmail === adminEnvEmail || (existingUser && existingUser.role === "Administrator");
    const roleToSet = isAdmin ? "Administrator" : "Customer";

    if (!existingUser) {
      existingUser = await User.create({
        name: name || (isAdmin ? adminEnvName : "RAVTRON Client"),
        email: inputEmail,
        role: roleToSet,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        active: true
      });
    }

    if (existingUser.active === false) {
      logSecurityEvent("GOOGLE_AUTH_DISABLED_PROFILE", { email: inputEmail });
      return NextResponse.json({ error: "Access denied. Your profile has been deactivated. Please contact support." }, { status: 403 });
    }

    const sessionUser = {
      name: existingUser.name || name,
      email: existingUser.email,
      phone: "",
      avatar: picture || "",
      joinDate: existingUser.joinDate,
      role: existingUser.role,
      isLoggedIn: true
    };

    const cookieStore = await cookies();
    setSessionCookie(cookieStore, sessionUser, getSessionCookieOptions(request));

    logSecurityEvent("GOOGLE_AUTH_SUCCESS", { email: inputEmail, role: existingUser.role });
    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error) {
    logSecurityEvent("GOOGLE_AUTH_SERVER_ERROR", { error: error.message });
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Google authentication failed. Please try again." : (error.message || "Google authentication failed.") },
      { status: 500 }
    );
  }
}
