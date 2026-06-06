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
  title: "Telegram Channel Blog",
  description: "A beautiful blog that aggregates and displays public Telegram channel posts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-blue-600">
              Telegram Channel Blog
            </h1>
            <span className="text-sm text-gray-500 font-medium">Real-time Sync</span>
          </div>
        </header>
        <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-100 mt-12 py-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Telegram Channel Blog. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
