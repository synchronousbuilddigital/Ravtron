/**
 * Centralized Shipping & Delivery Charge Calculator for Powerhub
 *
 * Policy:
 * - Free standard delivery on orders of ₹300 or above (subtotal >= 300 => ₹0).
 * - Delivery charge of ₹99 on orders under ₹300 (subtotal < 300 => ₹99).
 * - Empty cart / subtotal <= 0 => ₹0.
 * - No express shipping fees exist; standard delivery only.
 */

export const FREE_SHIPPING_THRESHOLD = 300;
export const STANDARD_SHIPPING_FEE = 99;

/**
 * Calculates delivery charges safely server-side and client-side.
 * Sanitizes all inputs against NaN, null, negative values, and unexpected types.
 *
 * @param {number} subtotal - The cart subtotal amount
 * @returns {number} The calculated delivery charge in INR (99 if under 300, 0 if 300+)
 */
export function calculateDeliveryCharge(subtotal) {
  const safeSubtotal = Number(subtotal);

  // If cart is empty or subtotal is invalid/zero, no delivery fee applies
  if (!Number.isFinite(safeSubtotal) || safeSubtotal <= 0) {
    return 0;
  }

  // Under ₹300: ₹99 delivery charge.
  // ₹300 and above: ₹0 (Free delivery).
  return safeSubtotal < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING_FEE : 0;
}
