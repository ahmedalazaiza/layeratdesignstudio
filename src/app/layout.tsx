import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://layerat.com"),
  title: {
    default: "Layerat Design Studio — Premium Free Figma Resources & UI Kits",
    template: "%s | Layerat Design Studio",
  },
  description:
    "Discover high-quality, production-ready Figma UI kits, mobile application flows, responsive design systems, and icon sets crafted with Auto Layout 5.0 and design variables.",
  keywords: [
    "Figma UI Kits",
    "Design Systems",
    "Figma Variables",
    "Auto Layout 5.0",
    "Free Figma Templates",
    "Mobile UI Design",
    "SaaS Dashboard UI",
    "Layerat Design Studio",
  ],
  authors: [{ name: "Layerat Design Studio", url: "https://layerat.com" }],
  creator: "Layerat Design Studio",
  publisher: "Layerat",
  icons: {
    icon: "/favicon.svg",
    apple: "/brand/icon-light-mode.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://layerat.com",
    title: "Layerat Design Studio — Premium Free Figma Resources",
    description:
      "100% Free, production-ready Figma UI kits, design systems, and components with variables.",
    siteName: "Layerat Design Studio",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Layerat Design Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Layerat Design Studio — Premium Free Figma Resources",
    description:
      "100% Free, production-ready Figma UI kits, design systems, and components.",
    creator: "@layerat",
    images: ["/brand/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#080c09" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary flex flex-col font-sans">
        <Providers>
          <ScrollToTop />
          <Navbar />
          <main className="flex-1 w-full pt-16 sm:pt-20 flex flex-col">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
