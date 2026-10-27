import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TODO Plan - Daily Planner & Analytics",
    template: "%s | TODO Plan",
  },
  description:
    "A sleek, minimalist daily planner and real-time productivity analytics dashboard built with Next.js, Firebase, and Chart.js.",
  keywords: [
    "daily planner",
    "todo list",
    "productivity dashboard",
    "habit tracker",
    "workload analytics",
    "firebase planner",
    "minimalist planner",
  ],
  authors: [{ name: "TODO Plan" }],
  openGraph: {
    title: "TODO Plan - Daily Planner & Real-Time Analytics",
    description:
      "Plan daily schedules, track habit consistency, and visualize workload trends in real-time.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
