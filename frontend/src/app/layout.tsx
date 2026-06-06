import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RadioPlayer from "../components/RadioPlayer";

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

  const androidUrl = process.env.NEXT_PUBLIC_DOWNLOAD_ANDROID_URL || "";
  const iosUrl = process.env.NEXT_PUBLIC_DOWNLOAD_IOS_URL || "";

  const hasAndroidLink = androidUrl && (androidUrl.startsWith("http://") || androidUrl.startsWith("https://"));
  const hasIosLink = iosUrl && (iosUrl.startsWith("http://") || iosUrl.startsWith("https://"));

  const radioStreamUrl = process.env.NEXT_PUBLIC_RADIO_STREAM_URL || "";
  const hasRadioStream = radioStreamUrl && (radioStreamUrl.startsWith("http://") || radioStreamUrl.startsWith("https://"));

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-blue-600">
              {blogTitle}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {hasAndroidLink && (
                  <a
                    href={androidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
                    title="Download Android App"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.6 9c-.2-1.1-.9-2-1.8-2.6L17 4.2c.1-.2 0-.5-.2-.6-.2-.1-.5 0-.6.2l-1.3 2.4c-1-.4-2-.6-3-.6s-2 .2-3 .6L7.6 3.8c-.1-.2-.4-.3-.6-.2-.2.1-.3.4-.2.6l1.2 2.2c-.9.6-1.6 1.5-1.8 2.6H17.6M9 8c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5m6 0c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5M5 10v6c0 .6.4 1 1 1h12c.6 0 1-.4 1-1v-6H5m3 8v3c0 .6-.4 1-1 1s-1-.4-1-1v-3h2m10 0v3c0 .6-.4 1-1 1s-1-.4-1-1v-3h2M4.5 10v5c0 .6-.4 1-1 1s-1-.4-1-1v-5c0-.6.4-1 1-1s1 .4 1 1m16 0v5c0 .6-.4 1-1 1s-1-.4-1-1v-5c0-.6.4-1 1-1s1 .4 1 1" />
                    </svg>
                    Android
                  </a>
                )}
                {hasIosLink && (
                  <a
                    href={iosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
                    title="Download iOS App"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
                    </svg>
                    iOS
                  </a>
                )}
              </div>
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
        {hasRadioStream && <RadioPlayer streamUrl={radioStreamUrl} />}
      </body>
    </html>
  );
}
