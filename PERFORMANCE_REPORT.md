# Website Performance Fix Report

## Root causes

- Homepage product content waited for the products API.
- Hero duplicated the full product request.
- Coupons competed with critical startup requests.
- All below-the-fold sections rendered immediately.

## Fixes

- Render bundled product/category data immediately and refresh in the background.
- Reuse CartProvider products in Hero, removing one product API request.
- Load coupons during browser idle time.
- Use content-visibility for distant homepage sections.

## Verification

A full Next.js production build succeeds: 44/44 static pages generated. Verification used a temporary process-only COOKIE_SECRET. Next.js also reports that middleware.js is deprecated in favor of proxy; that separate migration was left out of this focused speed fix. The build additionally reports pre-existing duplicate Mongoose indexes for razorpayOrderId and razorpayPaymentId.

