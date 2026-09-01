import type { Metadata } from "next";
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

import { getSiteConfig } from "@/lib/dbConfig";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const favicon = config.faviconUrl || "/favicon.ico";
  
  return {
    title: `${config.agencyName} — Software Development & Digital Consulting`,
    description: "Full-stack agency building modern web applications, SaaS products, and digital systems for high-growth businesses.",
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

import { Toaster } from "react-hot-toast";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();
  const favicon = config.faviconUrl || "/favicon.ico";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={favicon} sizes="any" />
        <link rel="shortcut icon" href={favicon} />
        <link rel="apple-touch-icon" href={favicon} />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white font-sans selection:bg-[#0A0A0A] selection:text-white dark:selection:bg-white dark:selection:text-[#0A0A0A] transition-colors duration-200">
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
      </body>
    </html>
  );
}
