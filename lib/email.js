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

// 4. Send Order Shipment Notification Email (Clean White Theme, High Visibility, Human Professional)
export async function sendShipmentNotificationEmail(
  order,
  courierName = "",
  trackingId = "",
  trackingUrl = "",
  dispatchNote = "",
  estimatedDelivery = ""
) {
  const recipient = order?.customerEmail;
  if (!recipient) return { success: false, error: "Recipient email is missing" };

  const finalCourier = courierName || order.courier || order.courierName || "Pan-India Express Logistics";
  const finalTrackingId = trackingId || order.trackingId || order.id || "RVT-EXPRESS";
  const finalTrackingUrl = trackingUrl || order.trackingUrl || `https://ravtron.in/support#track`;
  const finalDispatchNote = dispatchNote || order.dispatchNote || "";
  const finalEstDelivery = estimatedDelivery || order.estimatedDelivery || "3 - 5 Business Days";
  const dispatchDate = order.dispatchedAt || new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  // SEC-014: Sanitize all values before embedding in HTML
  const safeCustomerName = escapeHtml(order.customerName || "Customer");
  const safeOrderId = escapeHtml(order.id || "");
  const safeCourier = escapeHtml(finalCourier);
  const safeTrackingId = escapeHtml(finalTrackingId);
  const safeEstDelivery = escapeHtml(finalEstDelivery);
  const safeDispatchNote = escapeHtml(finalDispatchNote);
  const safeDispatchDate = escapeHtml(dispatchDate);

  // Validate tracking URL protocol (prevent javascript: or data: injection)
  const isSafeUrl = /^https?:\/\//i.test(finalTrackingUrl);
  const safeTrackingHref = isSafeUrl ? escapeHtml(finalTrackingUrl) : `https://ravtron.in/support#track`;

  // Format shipping address
  let addressText = "N/A";
  if (typeof order.shippingAddress === "object" && order.shippingAddress !== null) {
    const parts = [
      order.shippingAddress.street,
      order.shippingAddress.city,
      order.shippingAddress.state ? `${order.shippingAddress.state} - ${order.shippingAddress.zip || ""}` : order.shippingAddress.zip,
      order.shippingAddress.country || "India"
    ].filter(Boolean);
    addressText = parts.length > 0 ? parts.join(", ") : "N/A";
  } else if (order.shippingAddress) {
    addressText = String(order.shippingAddress);
  }
  const safeAddress = escapeHtml(addressText);
  const safePhone = escapeHtml(order.customerPhone || "");

  // Build items rows
  const itemsRowsHtml = Array.isArray(order.items) && order.items.length > 0
    ? order.items
        .map((item) => {
          const name = escapeHtml(item.name || "Item");
          const size = item.selectedSize ? ` <span style="color: #64748B; font-size: 11px;">(${escapeHtml(item.selectedSize)})</span>` : "";
          const qty = Number(item.qty || item.quantity || 1);
          const price = Number(item.price || 0);
          const lineTotal = price * qty;
          return `
          <tr>
            <td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #0F172A; font-weight: 600;">
              ${name}${size}
            </td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #0F172A; text-align: center; font-weight: 600;">
              ${qty}
            </td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #0F172A; text-align: right; font-weight: 700;">
              ₹${lineTotal.toLocaleString("en-IN")}
            </td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="3" style="padding: 10px 14px; color: #64748B; font-size: 12px;">Standard Package Items</td></tr>`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order #${safeOrderId} Has Been Dispatched</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F4F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0F172A;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F6F8; padding: 32px 12px;">
        <tr>
          <td align="center">
            
            <!-- Main Email Container (Pure White, Crisp Border, High Contrast) -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
              
              <!-- Brand Header -->
              <tr>
                <td style="background-color: #FFFFFF; padding: 28px 36px 20px 36px; border-bottom: 1px solid #EEF2F6;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="left" valign="middle">
                        <span style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px; color: #0F172A; text-decoration: none; display: inline-block;">RAVTRON<span style="color: #2563EB;">®</span></span>
                      </td>
                      <td align="right" valign="middle">
                        <span style="display: inline-block; background-color: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                          Dispatched
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Greeting & Announcement -->
              <tr>
                <td style="padding: 28px 36px 16px 36px;">
                  <h1 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800; color: #0F172A; line-height: 1.3;">
                    Your package is on the way!
                  </h1>
                  <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">
                    Hello <strong>${safeCustomerName}</strong>, your order <strong style="color: #0F172A;">#${safeOrderId}</strong> has been handed over to our delivery partner <strong>${safeCourier}</strong> and is currently en route to your delivery address.
                  </p>
                </td>
              </tr>

              <!-- Courier & Tracking Information Box -->
              <tr>
                <td style="padding: 8px 36px 20px 36px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                    
                    <tr>
                      <td style="padding: 16px 20px 8px 20px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td width="50%" valign="top" style="padding-bottom: 12px;">
                              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Courier Partner</div>
                              <div style="font-size: 15px; font-weight: 800; color: #0F172A; margin-top: 3px;">${safeCourier}</div>
                            </td>
                            <td width="50%" valign="top" style="padding-bottom: 12px;">
                              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Tracking / AWB Number</div>
                              <div style="font-size: 15px; font-weight: 800; color: #0F172A; margin-top: 3px; font-family: Consolas, 'Courier New', monospace; letter-spacing: 0.5px;">
                                ${safeTrackingId}
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td width="50%" valign="top">
                              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Dispatch Date</div>
                              <div style="font-size: 13px; font-weight: 700; color: #334155; margin-top: 3px;">${safeDispatchDate}</div>
                            </td>
                            <td width="50%" valign="top">
                              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Delivery</div>
                              <div style="font-size: 13px; font-weight: 700; color: #334155; margin-top: 3px;">${safeEstDelivery}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Track Package Action Button -->
                    <tr>
                      <td style="padding: 12px 20px 18px 20px; border-top: 1px solid #EEF2F6; background-color: #FFFFFF;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center">
                              <a href="${safeTrackingHref}" target="_blank" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 700; padding: 11px 24px; border-radius: 8px; letter-spacing: 0.3px;">
                                Track Your Package Online →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>

              ${
                safeDispatchNote
                  ? `<!-- Dispatch Note -->
              <tr>
                <td style="padding: 0 36px 18px 36px;">
                  <div style="background-color: #EFF6FF; border-left: 3px solid #2563EB; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 12px; color: #1E40AF; line-height: 1.5;">
                    <strong>Note from Fulfillment Team:</strong> ${safeDispatchNote}
                  </div>
                </td>
              </tr>`
                  : ""
              }

              <!-- Shipping Address -->
              <tr>
                <td style="padding: 0 36px 20px 36px;">
                  <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Delivery Address</div>
                    <div style="font-size: 13px; color: #0F172A; font-weight: 600; line-height: 1.5;">
                      ${safeCustomerName}<br>
                      ${safeAddress}
                      ${safePhone ? `<br><span style="color: #64748B; font-weight: 500;">Phone: ${safePhone}</span>` : ""}
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Items in this shipment -->
              <tr>
                <td style="padding: 0 36px 24px 36px;">
                  <div style="font-size: 12px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Shipment Summary</div>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #F8FAFC;">
                        <th style="padding: 9px 14px; border-bottom: 1px solid #E2E8F0; text-align: left; font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">Product</th>
                        <th style="padding: 9px 14px; border-bottom: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">Qty</th>
                        <th style="padding: 9px 14px; border-bottom: 1px solid #E2E8F0; text-align: right; font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsRowsHtml}
                    </tbody>
                    <tfoot>
                      <tr style="background-color: #F8FAFC;">
                        <td colspan="2" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #334155; text-align: right;">Total Paid:</td>
                        <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #0F172A; text-align: right;">₹${Number(order.total || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    </tfoot>
                  </table>
                </td>
              </tr>

              <!-- Help / Support Notice -->
              <tr>
                <td style="padding: 0 36px 28px 36px;">
                  <div style="border-top: 1px solid #EEF2F6; padding-top: 18px; font-size: 12px; color: #64748B; line-height: 1.6;">
                    Have questions about your delivery or need to update your address? Simply reply to this email or reach us at <a href="mailto:officerequirementsgurgaon@gmail.com" style="color: #0F172A; font-weight: 700; text-decoration: underline;">officerequirementsgurgaon@gmail.com</a>.
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 20px 36px; text-align: center; border-top: 1px solid #EEF2F6;">
                  <p style="margin: 0; font-size: 11px; color: #64748B; font-weight: 600;">
                    © ${new Date().getFullYear()} RAVTRON® by KSG Automation Pvt Ltd. All rights reserved.
                  </p>
                  <p style="margin: 4px 0 0 0; font-size: 10px; color: #94A3B8;">
                    Gurugram, Haryana, India · Official Order Tracking Notification
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

  const text = `
Hello ${order.customerName || "Customer"},

Your RAVTRON order #${order.id} has been dispatched!

SHIPMENT DETAILS:
- Courier Partner: ${finalCourier}
- Tracking / AWB Number: ${finalTrackingId}
- Dispatch Date: ${dispatchDate}
- Estimated Delivery: ${finalEstDelivery}
- Tracking URL: ${finalTrackingUrl}
${finalDispatchNote ? `- Note: ${finalDispatchNote}\n` : ""}
DELIVERY ADDRESS:
${addressText}

TOTAL PAID: ₹${Number(order.total || 0).toLocaleString("en-IN")}

If you have questions, contact us at officerequirementsgurgaon@gmail.com.

Thank you for shopping with RAVTRON®.
© ${new Date().getFullYear()} RAVTRON® by KSG Automation Pvt Ltd.
  `.trim();

  return sendEmail({
    to: recipient,
    subject: `🚚 Shipment Dispatched: Order #${order.id} via ${finalCourier}`,
    html,
    text
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


