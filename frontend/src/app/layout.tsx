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
  title: process.env.NEXT_PUBLIC_BLOG_TITLE || "Telegram Channel Blog",
  description: process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || "A beautiful blog that aggregates and displays public Telegram channel posts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const blogTitle = process.env.NEXT_PUBLIC_BLOG_TITLE || "Telegram Channel Blog";
  const blogSubtitle = process.env.NEXT_PUBLIC_BLOG_SUBTITLE || "Real-time Sync";

  const radioAppUrl = process.env.NEXT_PUBLIC_RADIO_APP_URL || "";
  const hasRadioLink = radioAppUrl && (radioAppUrl.startsWith("http://") || radioAppUrl.startsWith("https://"));

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-blue-600">
              {blogTitle}
            </h1>
            <div className="flex items-center gap-4">
              {hasRadioLink && (
                <a
                  href={radioAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Radio App
                </a>
              )}
              <span className="text-sm text-gray-500 font-medium">{blogSubtitle}</span>
            </div>
          </div>
        </header>
        <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-100 mt-12 py-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {blogTitle}. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
