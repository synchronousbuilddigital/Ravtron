import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import PWARegister from "../components/PWARegister";
import { OrganizationJsonLd } from "../components/JsonLd";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ravtron.in"),
  title: "RAVTRON — Exploring Ways to Connectivity | Official Store",
  description: "Explore high-performance display cables, docking stations, USB hubs, converters, networking gear & connectivity accessories by RAVTRON®.",
  manifest: "/manifest.json?v=2",
  appleWebApp: {
    capable: true,
    title: "RAVTRON",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/logo-apple.png",
  },
};

export const viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-PR2PW522";

  return (
    <html 
      lang="en" 
      className={`scroll-smooth light-mode ${inter.variable} ${plusJakartaSans.variable}`} 
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <GoogleTagManager gtmId={gtmId} />
      <body>
        <CartProvider>
          <OrganizationJsonLd />
          <PWARegister />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}