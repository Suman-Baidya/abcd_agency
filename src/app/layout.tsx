import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

import { Suspense } from "react";
import { getSiteConfig } from "@/lib/dbConfig";

import { Toaster } from "react-hot-toast";
import { PWAInstallBanner } from "@/components/ui/PWAInstallBanner";
import { NavigationProgressBar } from "@/components/ui/NavigationProgressBar";
import { JsonLd } from "@/components/seo/JsonLd";

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const favicon = config.faviconUrl?.trim() || "/images/abcd_square_logo.png";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://abcddigitalhub.com";
  
  return {
    metadataBase: new URL(appUrl),
    title: {
      default: `${config.agencyName} — Software Development & Digital Consulting`,
      template: `%s | ${config.agencyName}`,
    },
    description: "Full-stack software engineering partner and digital consulting hub building modern web applications, scalable SaaS products, and automated business workflows.",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: config.agencyName || "ABCD Digital Hub",
    },
    icons: {
      icon: [
        { url: favicon, sizes: "any" },
        { url: "/images/abcd_square_logo.png", sizes: "192x192", type: "image/png" },
        { url: "/images/abcd_square_logo.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: favicon,
      apple: "/images/abcd_square_logo.png",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: appUrl,
      siteName: config.agencyName || "ABCD Digital Hub",
      title: `${config.agencyName} — Software Development & Digital Consulting`,
      description: "Full-stack software engineering partner and digital consulting hub building modern web applications, scalable SaaS products, and automated business workflows.",
      images: [
        {
          url: "/images/abcd_square_logo.png",
          width: 512,
          height: 512,
          alt: config.agencyName || "ABCD Digital Hub",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.agencyName} — Software Development & Digital Consulting`,
      description: "Full-stack software engineering partner and digital consulting hub building modern web applications, scalable SaaS products, and automated business workflows.",
      images: ["/images/abcd_square_logo.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();
  const favicon = config.faviconUrl?.trim() || "/images/abcd_square_logo.png";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={favicon} sizes="any" />
        <link rel="apple-touch-icon" href="/images/abcd_square_logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0A0A0A" />
        <JsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa_prompt_ready'));
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white font-sans selection:bg-[#0A0A0A] selection:text-white dark:selection:bg-white dark:selection:text-[#0A0A0A] transition-colors duration-200">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#0A0A0A',
              color: '#FFFFFF',
              border: '1px solid #262626',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              padding: '16px 24px',
              letterSpacing: '-0.01em',
              minWidth: '300px',
            },
            success: {
              iconTheme: {
                primary: '#FFFFFF',
                secondary: '#0A0A0A',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            }
          }} 
        />
        {children}
        <PWAInstallBanner />
      </body>
    </html>
  );
}
