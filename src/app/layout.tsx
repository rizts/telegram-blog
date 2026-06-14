import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChannelLogo from "../components/ChannelLogo";
import { RightSidebar } from "../components/RightSidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BLOG_TITLE || "Telegram Channel Blog",
  description: process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || "A beautiful blog that aggregates and displays public Telegram channel posts.",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/channel/photo`,
    apple: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/channel/photo`,
  }
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
    <html lang="id" className={`${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Header */}
        <header style={{
          background: 'rgba(255, 252, 230, 0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(210, 190, 120, 0.35)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          {/* Brand (logo + title + subtitle) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <ChannelLogo apiUrl={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"} title={blogTitle} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <h1 className="text-xl font-bold truncate" style={{ color: 'var(--accent-primary)', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
                  {blogTitle}
                </h1>
                <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {blogSubtitle}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {children}
          </div>
          <div className="w-full md:w-[320px] shrink-0">
            <RightSidebar
              hasRadio={hasRadioStream !== ''}
              radioStreamUrl={radioStreamUrl}
              hasAndroid={hasAndroidLink !== ''}
              androidUrl={androidUrl}
              hasIos={hasIosLink !== ''}
              iosUrl={iosUrl}
            />
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(210, 190, 120, 0.3)',
          background: 'rgba(255, 252, 220, 0.6)',
          padding: '24px 0',
          marginTop: '48px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-muted)',
        }}>
          <p>© {new Date().getFullYear()} <strong style={{ color: 'var(--accent-primary)' }}>{blogTitle}</strong>. All rights reserved.</p>
        </footer>

      </body>
    </html>
  );
}
