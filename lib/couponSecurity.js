import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { escapeRegex } from "@/lib/security";

/**
 * Server-Side Secure Coupon Validator & Discount Calculator
 * OWASP Top 10 Compliant:
 *   - Prevents NoSQL Injection on coupon query
 *   - Prevents ReDoS / Regex injection on email lookup
 *   - Prevents Category & Product Scope Bypasses
 *   - Enforces per-user single-use restriction
 *   - Enforces percentage (0-100%) and fixed discount mathematical limits
 *
 * @param {Object} params
 * @param {string} params.couponCodeInput - Raw coupon code from request
 * @param {string} params.customerEmail - Customer email address
 * @param {Array} params.validatedItems - Array of DB-verified order items [{ productId, price, qty }]
 * @param {number} params.subtotal - Server-recalculated cart subtotal
 * @returns {Promise<{ verifiedSavings: number, couponCode: string, isOneTime: boolean }>}
 */
export async function calculateVerifiedCouponDiscount({
  couponCodeInput,
  customerEmail,
  validatedItems = [],
  subtotal = 0,
}) {
  // 1. Input Type Guard — NoSQL Injection Prevention
  if (!couponCodeInput || typeof couponCodeInput !== "string") {
    return { verifiedSavings: 0, couponCode: "", isOneTime: false };
  }

  const cleanCode = couponCodeInput.trim().toUpperCase();
  if (!cleanCode) {
    return { verifiedSavings: 0, couponCode: "", isOneTime: false };
  }

  await dbConnect();

  // 2. Fetch Coupon Document securely
  const couponDoc = await Coupon.findOne({ code: cleanCode, active: true }).lean();
  if (!couponDoc) {
    return { verifiedSavings: 0, couponCode: "", isOneTime: false };
  }

  const isOneTime = couponDoc.oneTimePerUser !== false;

  // 3. Minimum Purchase Validation
  if (couponDoc.minPurchase > 0 && subtotal < couponDoc.minPurchase) {
    return { verifiedSavings: 0, couponCode: "", isOneTime };
  }

  // 4. Expiry Date Validation
  if (couponDoc.expiryDate) {
    const today = new Date();
    const expiry = new Date(couponDoc.expiryDate);
    expiry.setHours(23, 59, 59, 999);
    if (today > expiry) {
      return { verifiedSavings: 0, couponCode: "", isOneTime };
    }
  }

  // 5. Per-User Single Use Validation (Checks both atomic ledger and order history)
  if (isOneTime && customerEmail && typeof customerEmail === "string") {
    const cleanEmail = customerEmail.trim().toLowerCase();
    if (cleanEmail) {
      // 5a. Check atomic usedBy array on Coupon document
      if (Array.isArray(couponDoc.usedBy)) {
        const alreadyClaimed = couponDoc.usedBy.some(
          (u) => (u.email || "").toLowerCase() === cleanEmail
        );
        if (alreadyClaimed) {
          return { verifiedSavings: 0, couponCode: "", isOneTime };
        }
      }

      // 5b. Check historical Orders collection
      const existingOrder = await Order.findOne({
        customerEmail: new RegExp(`^${escapeRegex(cleanEmail)}$`, "i"),
        coupon: cleanCode,
        status: { $ne: "Cancelled" },
      }).lean();

      if (existingOrder) {
        return { verifiedSavings: 0, couponCode: "", isOneTime };
      }
    }
  }

  // 6. Category / Product Scope Discount Calculation
  let applicableSubtotal = subtotal;

  if (couponDoc.applicableProductId) {
    // Product-specific coupon
    const targetItem = validatedItems.find(
      (item) => String(item.productId) === String(couponDoc.applicableProductId)
    );
    if (!targetItem) {
      return { verifiedSavings: 0, couponCode: "", isOneTime }; // Target product not in cart
    }
    applicableSubtotal = (Number(targetItem.price) || 0) * (Number(targetItem.qty) || 1);
  } else if (
    couponDoc.applicableCategory &&
    couponDoc.applicableCategory !== "All"
  ) {
    // Category-specific coupon
    let categorySubtotal = 0;
    for (const item of validatedItems) {
      const product = await Product.findOne({ id: item.productId })
        .select("category")
        .lean();
      if (
        product &&
        product.category &&
        product.category.toLowerCase() === couponDoc.applicableCategory.toLowerCase()
      ) {
        categorySubtotal += (Number(item.price) || 0) * (Number(item.qty) || 1);
      }
    }
    if (categorySubtotal <= 0) {
      return { verifiedSavings: 0, couponCode: "", isOneTime }; // No matching category items in cart
    }
    applicableSubtotal = categorySubtotal;
  }

  // 7. Calculate Discount Amount Safely
  let verifiedSavings = 0;

  if (couponDoc.type === "percentage") {
    // Clamp percentage between 0% and 100%
    const pct = Math.min(100, Math.max(0, Number(couponDoc.discountValue) || 0));
    verifiedSavings = Math.round((applicableSubtotal * pct) / 100);
  } else {
    // Fixed amount discount
    const fixedVal = Math.max(0, Number(couponDoc.discountValue) || 0);
    verifiedSavings = Math.min(fixedVal, applicableSubtotal);
  }

  // Savings cannot exceed overall cart subtotal
  verifiedSavings = Math.min(verifiedSavings, subtotal);

  return { verifiedSavings, couponCode: cleanCode, isOneTime };
}

/**
 * Atomically claim and lock a coupon during order creation.
 * Uses atomic MongoDB conditional updates to eliminate double-use race conditions.
 *
 * @param {Object} params
 * @param {string} params.couponCode - Coupon code to redeem
 * @param {string} params.customerEmail - Customer email
 * @param {string} params.orderId - Created or provisional Order ID
 * @param {ClientSession} [params.session] - Optional MongoDB transaction session
 * @returns {Promise<{ success: boolean, reason?: string, coupon?: Object }>}
 */
export async function redeemCouponAtomically({
  couponCode,
  customerEmail,
  orderId = "",
  session = null,
}) {
  if (!couponCode || typeof couponCode !== "string") {
    return { success: false, reason: "INVALID_COUPON_CODE" };
  }
  if (!customerEmail || typeof customerEmail !== "string") {
    return { success: false, reason: "INVALID_CUSTOMER_EMAIL" };
  }

  const cleanCode = couponCode.trim().toUpperCase();
  const cleanEmail = customerEmail.trim().toLowerCase();

  await dbConnect();

  // Find the coupon first to verify existence and check if single-use
  const coupon = await Coupon.findOne({ code: cleanCode }).lean();
  if (!coupon || !coupon.active) {
    return { success: false, reason: "COUPON_NOT_FOUND_OR_INACTIVE" };
  }

  const isOneTime = coupon.oneTimePerUser !== false;

  // Atomic condition: If one-time per user, ensure email does NOT already exist in usedBy array
  const query = {
    code: cleanCode,
    active: true,
    ...(isOneTime ? { "usedBy.email": { $ne: cleanEmail } } : {}),
    ...(typeof coupon.usageLimit === "number" && coupon.usageLimit > 0
      ? { usageCount: { $lt: coupon.usageLimit } }
      : {}),
  };

  const update = {
    $push: {
      usedBy: {
        email: cleanEmail,
        orderId: String(orderId || "").trim(),
        usedAt: new Date(),
      },
    },
    $inc: { usageCount: 1 },
  };

  const options = { new: true };
  if (session) {
    options.session = session;
  }

  // Atomic Compare-And-Swap Execution
  const updatedCoupon = await Coupon.findOneAndUpdate(query, update, options);

  if (!updatedCoupon) {
    // Condition failed — another concurrent request claimed this coupon simultaneously!
    return {
      success: false,
      reason: "COUPON_ALREADY_USED_OR_EXHAUSTED",
    };
  }

  return { success: true, coupon: updatedCoupon };
}

/**
 * Release an atomic coupon reservation if order processing fails or is cancelled.
 *
 * @param {Object} params
 * @param {string} params.couponCode - Coupon code to release
 * @param {string} params.customerEmail - Customer email
 * @param {string} params.orderId - Order ID to remove from ledger
 */
export async function releaseCouponRedemption({
  couponCode,
  customerEmail,
  orderId = "",
}) {
  if (!couponCode || !customerEmail) return;

  const cleanCode = couponCode.trim().toUpperCase();
  const cleanEmail = customerEmail.trim().toLowerCase();

  await dbConnect();

  try {
    await Coupon.updateOne(
      { code: cleanCode },
      {
        $pull: {
          usedBy: {
            email: cleanEmail,
            ...(orderId ? { orderId: String(orderId).trim() } : {}),
          },
        },
        $inc: { usageCount: -1 },
      }
    );
  } catch (err) {
    console.error(`[COUPON] Failed to release coupon redemption for ${cleanCode}:`, err.message);
  }
}
