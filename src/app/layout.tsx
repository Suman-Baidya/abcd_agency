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

export const metadata: Metadata = {
  title: "ABCD Agency — Software Development & Digital Consulting",
  description:
    "Full-stack agency building modern web applications, SaaS products, and digital systems for high-growth businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white font-sans selection:bg-[#0A0A0A] selection:text-white dark:selection:bg-white dark:selection:text-[#0A0A0A] transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
