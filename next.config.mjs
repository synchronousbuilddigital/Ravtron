/** @type {import('next').NextConfig} */

// and  Content-Security-Policy
// Built specifically for this app's dependency surface:
//   - Google OAuth popup  → accounts.google.com, apis.google.com
//   - Cloudinary uploads  → res.cloudinary.com
//   - Google Fonts        → fonts.googleapis.com, fonts.gstatic.com
//   - Google profile pics → lh*.googleusercontent.com
//
// 'unsafe-inline' on script-src is required by Next.js for hydration scripts.
// 'unsafe-eval' is only allowed in development (source maps). Removed in production.
const isDev = process.env.NODE_ENV === "development";

const ContentSecurityPolicy = [
  // Default: only self
  "default-src 'self'",

  // Scripts: self + Next.js inline hydration + Google OAuth + Razorpay checkout
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://accounts.google.com https://apis.google.com https://checkout.razorpay.com https://*.razorpay.com`,

  // Styles: self + inline (Tailwind/CSS-in-JS) + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

  // Fonts: self + Google Fonts static assets
  "font-src 'self' https://fonts.gstatic.com",

  // Images: self + data URIs + blob + Cloudinary + Google avatars
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com https://*.razorpay.com",

  // XHR/Fetch: self + Google OAuth token endpoints + Razorpay API + Postal Pincode
  "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://api.razorpay.com https://lumberjack.razorpay.com https://lumberjack-cx.razorpay.com https://*.razorpay.com https://api.postalpincode.in",

  // Frames: Google OAuth popup + Razorpay checkout iframe
  "frame-src https://accounts.google.com https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com",

  // Block all plugins (Flash etc.)
  "object-src 'none'",

  // Restrict <base> to same origin
  "base-uri 'self'",

  // Restrict form submissions to same origin
  "form-action 'self'",

  // Prevent this page from being embedded in iframes (defence-in-depth with X-Frame-Options)
  "frame-ancestors 'none'",
].join("; ");

const nextConfig = {
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@react-oauth/google"],
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          // SEC-015: Content-Security-Policy
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

