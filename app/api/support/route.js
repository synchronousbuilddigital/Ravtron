import { NextResponse } from "next/server";
import { sendSupportTicketEmail, sendEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyBotProtection, sanitizeEmail } from "@/lib/security";

export async function POST(request) {
  try {
    // SEC-017 Layer 1: IP-based rate limit — 5 submissions per minute per IP
    const clientIp = getClientIp(request);
    const ipCheck = await rateLimit(`support_ip_${clientIp}`, 5, 60 * 1000);
    if (!ipCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before submitting again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await request.json();

    // SEC-017 Layer 2: Honeypot bot detection (same mechanism as login)
    const botCheck = verifyBotProtection(body);
    if (botCheck.isBot) {
      return NextResponse.json({ error: "Invalid submission detected." }, { status: 400 });
    }

    const { name, email, subject, message, category, proofUrl } = body;

    if (!email || !subject || !message) {
      return NextResponse.json({ error: "Email, subject, and message are required." }, { status: 400 });
    }

    // SEC-017 Layer 3: Per-email rate limit — max 3 tickets per 10 minutes per sender
    const cleanEmail = sanitizeEmail(email);
    const emailCheck = await rateLimit(`support_email_${cleanEmail}`, 3, 10 * 60 * 1000);
    if (!emailCheck.success) {
      return NextResponse.json(
        { error: "You have submitted too many support tickets recently. Please wait 10 minutes before trying again." },
        { status: 429, headers: { "Retry-After": "600" } }
      );
    }

    const ticketResult = await sendSupportTicketEmail({ name, email, subject, message, category });

    // SEC-014: Escape all user-supplied fields to prevent HTML injection in admin alert email
    const esc = (s) => s == null ? "" : String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;");

    const adminEmail = process.env.ADMIN_EMAIL || "officerequirementsgurgaon@gmail.com";
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `📩 New Support Ticket: ${esc(subject)} (${esc(email)})`,
        text: `Support ticket received from ${name} (${email}). Category: ${category}. Subject: ${subject}. Message: ${message}${proofUrl ? ` Attachment: ${proofUrl}` : ""}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
            <h3 style="color: #3674B5;">📩 New Support Ticket Inquiry</h3>
            <p><strong>Customer Name:</strong> ${esc(name) || "N/A"}</p>
            <p><strong>Email:</strong> ${esc(email)}</p>
            <p><strong>Category:</strong> ${esc(category) || "General Query"}</p>
            <p><strong>Subject:</strong> ${esc(subject)}</p>
            ${proofUrl ? `<p><strong>Proof Attachment:</strong> <a href="${esc(proofUrl)}" target="_blank" style="color: #3674B5; font-weight: bold;">View Uploaded Invoice Proof Document</a></p>` : ""}
            <p><strong>Message:</strong></p>
            <blockquote style="background: #F1F5F9; padding: 12px; border-left: 4px solid #3674B5; margin: 0;">
              ${esc(message)}
            </blockquote>
          </div>
        `
      }).catch((err) => console.error("Admin support ticket email alert error:", err));
    }

    return NextResponse.json({ success: true, message: "Support ticket registered successfully.", result: ticketResult });
  } catch (error) {
    console.error("POST /api/support error:", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Failed to submit support ticket. Please try again." : (error.message || "Failed to submit support ticket.") },
      { status: 500 }
    );
  }
}

