import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { ParticleBg } from "@/components/effects/particle-bg";
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
    default: "Portfolio & Blog",
    template: "%s | Portfolio & Blog",
  },
  description: "Personal blog about web development, design, and technology.",
  metadataBase: new URL("https://tvegis-blog.vercel.app"),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Portfolio & Blog",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      notranslate: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} notranslate`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <meta name="baidu" content="notranslate" />
      </head>
      <body className="min-h-screen bg-white dark:bg-[#05050a] text-zinc-900 dark:text-zinc-100 antialiased" translate="no">
        <ThemeProvider>
          <ScrollProgress />
          <ParticleBg />
          <CustomCursor />
          <Header />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
