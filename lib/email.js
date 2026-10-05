import nodemailer from "nodemailer";

// SEC-014: Escape user-supplied strings before embedding in HTML email templates
// Prevents stored XSS / HTML injection attacks via support forms or order fields
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Helper to create transport from environment variables
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL || "officerequirementsgurgaon@gmail.com";
  const pass = process.env.SMTP_PASS;

  if (!host || !pass) {
    return null; // Return null if SMTP credentials are not configured yet
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

// Generic mail sender wrapper with fallback logging
export async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || `RAVTRON® <${process.env.ADMIN_EMAIL || "officerequirementsgurgaon@gmail.com"}>`;

  // SEC-017: Mask sensitive 6-digit OTP codes from server console logs
  const safeSubject = (subject || "").replace(/\b\d{6}\b/g, "******");

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log(`[EMAIL NOTICE] SMTP not configured in .env.local. Email preview for "${to}":\nSubject: ${safeSubject}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      headers: {
        "X-Priority": "1 (Highest)",
        "X-MSMail-Priority": "High",
        "Importance": "High"
      }
    });

    console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // SEC-017: Log only safe error metadata — never log full error object which may contain message content
    console.error("[EMAIL ERROR] Failed to send email via SMTP:", { code: error.code, command: error.command, responseCode: error.responseCode });
    return { success: false, error: error.message };
  }
}

// 1. Send Customer Order Confirmation & Receipt Email
export async function sendOrderConfirmationEmail(order) {
  const recipient = order.customerEmail;
  if (!recipient) return;

  const itemsHtml = Array.isArray(order.items)
    ? order.items
        .map(
          (item) => `
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B; font-weight: 600;">
              ${item.name} ${item.selectedSize ? `<span style="color: #64748B; font-size: 11px;">(${item.selectedSize})</span>` : ""}
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B; text-align: center; font-weight: 600;">
              ${item.qty || 1}
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #3674B5; text-align: right; font-weight: 800;">
              ₹${((item.price || 0) * (item.qty || 1)).toLocaleString()}
            </td>
          </tr>`
        )
        .join("")
    : "";

  const shippingAddr = typeof order.shippingAddress === "object" && order.shippingAddress !== null
    ? `${order.shippingAddress.street || ""}, ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} - ${order.shippingAddress.zip || ""}`
    : String(order.shippingAddress || "N/A");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - RAVTRON®</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color: #3674B5; padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: 2px;">RAVTRON®</h1>
                  <p style="margin: 6px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.85); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Order Confirmation & Official Receipt</p>
                </td>
              </tr>

              <!-- Greeting & Status -->
              <tr>
                <td style="padding: 32px 40px 20px 40px;">
                  <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #1E293B; font-weight: 800;">Thank You for Your Order, ${order.customerName || "Valued Customer"}!</h2>
                  <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.6;">
                    We have successfully received your order <strong style="color: #3674B5;">#${order.id}</strong>. Our fulfillment center in Gurugram is preparing your items for express shipment.
                  </p>
                </td>
              </tr>

              <!-- Order Info Card -->
              <tr>
                <td style="padding: 0 40px 24px 40px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="16" style="background-color: #F1F5F9; border-radius: 12px;">
                    <tr>
                      <td>
                        <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 800; letter-spacing: 1px;">Order Reference</div>
                        <div style="font-size: 15px; font-weight: 800; color: #1E293B; margin-top: 2px;">#${order.id}</div>
                      </td>
                      <td>
                        <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 800; letter-spacing: 1px;">Order Date</div>
                        <div style="font-size: 14px; font-weight: 700; color: #1E293B; margin-top: 2px;">${order.date || new Date().toLocaleDateString()}</div>
                      </td>
                      <td>
                        <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 800; letter-spacing: 1px;">Payment Method</div>
                        <div style="font-size: 14px; font-weight: 700; color: #1E293B; margin-top: 2px;">${order.paymentMethod || "Prepaid"}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 0 40px 24px 40px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #1E293B; font-weight: 800; letter-spacing: 1px;">Items Summary</h3>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #F8F9FA;">
                        <th style="padding: 10px 16px; border-bottom: 2px solid #E2E8F0; text-align: left; font-size: 11px; color: #64748B; font-weight: 800; text-transform: uppercase;">Product Description</th>
                        <th style="padding: 10px 16px; border-bottom: 2px solid #E2E8F0; text-align: center; font-size: 11px; color: #64748B; font-weight: 800; text-transform: uppercase;">Qty</th>
                        <th style="padding: 10px 16px; border-bottom: 2px solid #E2E8F0; text-align: right; font-size: 11px; color: #64748B; font-weight: 800; text-transform: uppercase;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Price Breakdown & Address -->
              <tr>
                <td style="padding: 0 40px 32px 40px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="55%" valign="top" style="padding-right: 20px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #64748B; font-weight: 800; letter-spacing: 1px;">Delivery Address</h4>
                        <p style="margin: 0; font-size: 13px; color: #1E293B; font-weight: 600; line-height: 1.5;">
                          <strong>${order.customerName || "Customer"}</strong><br>
                          ${shippingAddr}<br>
                          Phone: ${order.customerPhone || "N/A"}
                        </p>
                      </td>
                      <td width="45%" valign="top">
                        <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #1E293B;">
                          <tr>
                            <td style="color: #64748B; font-weight: 600;">Grand Total Paid:</td>
                            <td style="text-align: right; font-weight: 900; font-size: 18px; color: #3674B5;">₹${(order.total || 0).toLocaleString()}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1E293B; padding: 24px 40px; text-align: center; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
                  <p style="margin: 0; font-size: 12px; color: #94A3B8; font-weight: 600;">
                    Need help with your order? Reach us at <a href="mailto:officerequirementsgurgaon@gmail.com" style="color: #3674B5; text-decoration: none; font-weight: 800;">officerequirementsgurgaon@gmail.com</a>
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748B;">
                    © ${new Date().getFullYear()} RAVTRON® by KSG Automation Pvt Ltd. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipient,
    subject: `⚡ Order Confirmed: #${order.id} — RAVTRON®`,
    html,
    text: `Thank you for your order #${order.id}! Total paid: ₹${order.total}. We are preparing your order for shipment.`
  });
}

// 2. Send New Order Alert Email to Admin
export async function sendNewOrderAdminAlert(order) {
  const adminEmail = process.env.ADMIN_EMAIL || "officerequirementsgurgaon@gmail.com";

  const shippingAddr = typeof order.shippingAddress === "object" && order.shippingAddress !== null
    ? `${order.shippingAddress.street || ""}, ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} - ${order.shippingAddress.zip || ""}`
    : String(order.shippingAddress || "N/A");

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #F8F9FA; padding: 30px;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; padding: 30px; border-radius: 16px; border: 1px solid #E2E8F0;">
        <h2 style="color: #3674B5; margin-top: 0;">🔔 New Order Received: #${order.id}</h2>
        <p style="font-size: 14px; color: #1E293B;">A new purchase has been placed on RAVTRON® website.</p>

        <table width="100%" cellpadding="8" style="font-size: 13px; background: #F1F5F9; border-radius: 8px; margin: 16px 0;">
          <tr><td><strong>Order ID:</strong></td><td>#${order.id}</td></tr>
          <tr><td><strong>Customer Name:</strong></td><td>${order.customerName || "Customer"}</td></tr>
          <tr><td><strong>Customer Email:</strong></td><td>${order.customerEmail}</td></tr>
          <tr><td><strong>Customer Phone:</strong></td><td>${order.customerPhone || "N/A"}</td></tr>
          <tr><td><strong>Total Amount:</strong></td><td style="color: #3674B5; font-weight: bold;">₹${(order.total || 0).toLocaleString()}</td></tr>
          <tr><td><strong>Shipping Address:</strong></td><td>${shippingAddr}</td></tr>
        </table>

        <p style="font-size: 12px; color: #64748B;">Log into the RAVTRON Admin Console to process and dispatch this shipment.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `🔔 New Order Received: #${order.id} (₹${order.total})`,
    html,
    text: `New order #${order.id} received from ${order.customerName} (${order.customerEmail}) for ₹${order.total}.`
  });
}

// 4. Send Order Shipment Notification Email
export async function sendShipmentNotificationEmail(order, courierName = "Delhivery / BlueDart", trackingId = "") {
  const recipient = order.customerEmail;
  if (!recipient) return;

  const trackCode = trackingId || order.id || "RVT-EXPRESS";
  const courier = courierName || "Pan-India Express Logistics";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Dispatched - RAVTRON®</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color: #3674B5; padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: 2px;">RAVTRON®</h1>
                  <p style="margin: 6px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.85); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Express Order Shipment Dispatch</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 32px 40px 20px 40px;">
                  <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #1E293B; font-weight: 800;">Great News! Your Order Has Shipped 🚚</h2>
                  <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.6;">
                    Hello ${order.customerName || "Customer"}, your order <strong style="color: #3674B5;">#${order.id}</strong> has been verified, packed, and handed over to our courier partner for express delivery.
                  </p>
                </td>
              </tr>

              <!-- Tracking Details Card -->
              <tr>
                <td style="padding: 0 40px 24px 40px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="16" style="background-color: #F1F5F9; border-radius: 12px;">
                    <tr>
                      <td>
                        <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 800; letter-spacing: 1px;">Courier Partner</div>
                        <div style="font-size: 15px; font-weight: 800; color: #1E293B; margin-top: 2px;">${courier}</div>
                      </td>
                      <td>
                        <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 800; letter-spacing: 1px;">Tracking AWB / ID</div>
                        <div style="font-size: 14px; font-weight: 700; color: #3674B5; margin-top: 2px;">${trackCode}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Track Button -->
              <tr>
                <td style="padding: 0 40px 32px 40px; text-align: center;">
                  <a href="https://ravtron.in/support#track" style="display: inline-block; background-color: #3674B5; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(54,116,181,0.3);">
                    Track Live Package Status →
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1E293B; padding: 24px 40px; text-align: center; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
                  <p style="margin: 0; font-size: 12px; color: #94A3B8; font-weight: 600;">
                    Questions? Email us at <a href="mailto:officerequirementsgurgaon@gmail.com" style="color: #3674B5; text-decoration: none; font-weight: 800;">officerequirementsgurgaon@gmail.com</a>
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748B;">
                    © ${new Date().getFullYear()} RAVTRON® by KSG Automation Pvt Ltd. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipient,
    subject: `🚚 Your Order Has Shipped: #${order.id} — RAVTRON®`,
    html,
    text: `Your RAVTRON order #${order.id} has shipped via ${courier}. Tracking ID: ${trackCode}.`
  });
}

// 5. Send Support Ticket Confirmation Email
export async function sendSupportTicketEmail({ name, email, subject, message, category = "General Query" }) {
  if (!email) return;

  const ticketId = "TKT-" + Math.floor(100000 + Math.random() * 900000);

  // SEC-014: Escape all user-supplied fields before embedding in HTML
  const safeName     = escapeHtml(name) || "Customer";
  const safeCategory = escapeHtml(category);
  const safeSubject  = escapeHtml(subject);
  const safeMessage  = escapeHtml(message);

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #F8F9FA; padding: 30px;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; padding: 30px; border-radius: 16px; border: 1px solid #E2E8F0;">
        <h2 style="color: #3674B5; margin-top: 0;">Support Ticket Created: #${ticketId}</h2>
        <p style="font-size: 14px; color: #1E293B;">
          Dear <strong>${safeName}</strong>, thank you for reaching out to RAVTRON® Customer Support.
        </p>

        <div style="background: #F1F5F9; padding: 16px; border-radius: 10px; margin: 20px 0; font-size: 13px; color: #1E293B;">
          <p style="margin: 0 0 8px 0;"><strong>Category:</strong> ${safeCategory}</p>
          <p style="margin: 0 0 8px 0;"><strong>Subject:</strong> ${safeSubject}</p>
          <p style="margin: 0;"><strong>Message:</strong> "${safeMessage}"</p>
        </div>

        <p style="font-size: 13px; color: #64748B; line-height: 1.6;">
          Our technical support team is reviewing your ticket and will respond within 4–6 business hours.
        </p>

        <p style="font-size: 12px; color: #94A3B8; margin-top: 24px;">© ${new Date().getFullYear()} RAVTRON® Support Desk</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `📩 Support Ticket Created [#${ticketId}]: ${subject}`,
    html,
    text: `Support ticket #${ticketId} created. Subject: ${subject}. We will reply within 4-6 business hours.`
  });
}



// 7. Send Registration Email Verification OTP
export async function sendVerificationOTPEmail({ email, name, otp }) {
  if (!email || !otp) return { success: false, error: "Email and OTP are required" };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification - RAVTRON®</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color: #3674B5; padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: 2px;">RAVTRON®</h1>
                  <p style="margin: 6px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.85); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Account Email Verification</p>
                </td>
              </tr>

              <!-- Greeting & Content -->
              <tr>
                <td style="padding: 32px 40px 20px 40px;">
                  <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #1E293B; font-weight: 800;">Verify Your Email Address</h2>
                  <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.6;">
                    Hello <strong>${name || "Valued User"}</strong>, thank you for registering with RAVTRON®. Please use the following 6-digit One-Time Password (OTP) code to complete your email verification:
                  </p>
                </td>
              </tr>

              <!-- OTP Box -->
              <tr>
                <td style="padding: 10px 40px 24px 40px; text-align: center;">
                  <div style="display: inline-block; background-color: #F1F5F9; border: 2px dashed #3674B5; padding: 18px 36px; border-radius: 16px; font-size: 32px; font-weight: 900; color: #3674B5; letter-spacing: 8px;">
                    ${otp}
                  </div>
                  <p style="margin: 12px 0 0 0; font-size: 12px; color: #94A3B8; font-weight: 600;">
                    This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1E293B; padding: 24px 40px; text-align: center; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
                  <p style="margin: 0; font-size: 12px; color: #94A3B8; font-weight: 600;">
                    If you did not request this verification code, please ignore this email.
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748B;">
                    © ${new Date().getFullYear()} RAVTRON® by KSG Automation Pvt Ltd. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Your RAVTRON® Account Verification Code: ${otp}`,
    html,
    text: `Your RAVTRON account verification code is ${otp}. This code is valid for 10 minutes.`
  });
}

// 8. Send Password Reset OTP Email
export async function sendPasswordResetOTPEmail({ email, name, otp }) {
  if (!email || !otp) return { success: false, error: "Email and OTP are required" };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset OTP - RAVTRON®</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color: #EF4444; padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: 2px;">RAVTRON®</h1>
                  <p style="margin: 6px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.85); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Password Reset Verification</p>
                </td>
              </tr>

              <!-- Greeting & Content -->
              <tr>
                <td style="padding: 32px 40px 20px 40px;">
                  <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #1E293B; font-weight: 800;">Password Reset Request</h2>
                  <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.6;">
                    Hello <strong>${name || "Valued User"}</strong>, a password reset was requested for your RAVTRON® account. Please use the following 6-digit One-Time Password (OTP) to reset your password:
                  </p>
                </td>
              </tr>

              <!-- OTP Box -->
              <tr>
                <td style="padding: 10px 40px 24px 40px; text-align: center;">
                  <div style="display: inline-block; background-color: #FEF2F2; border: 2px dashed #EF4444; padding: 18px 36px; border-radius: 16px; font-size: 32px; font-weight: 900; color: #EF4444; letter-spacing: 8px;">
                    ${otp}
                  </div>
                  <p style="margin: 12px 0 0 0; font-size: 12px; color: #94A3B8; font-weight: 600;">
                    This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                  </p>
                </td>
              </tr>

              <!-- Security Warning Footer -->
              <tr>
                <td style="background-color: #1E293B; padding: 24px 40px; text-align: center; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
                  <p style="margin: 0; font-size: 12px; color: #94A3B8; font-weight: 600;">
                    If you did not request a password reset, please ignore this email or contact support immediately.
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748B;">
                    © ${new Date().getFullYear()} RAVTRON® by KSG Automation Pvt Ltd. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Your RAVTRON® Password Reset Code: ${otp}`,
    html,
    text: `Your RAVTRON password reset verification code is ${otp}. This code is valid for 10 minutes.`
  });
}


