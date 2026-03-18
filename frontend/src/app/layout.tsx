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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Gerusta — Telegram Bot Studio и Mini Apps",
    template: "%s | Gerusta",
  },
  description:
    "Разрабатываем Telegram-ботов и Mini Apps: автоматизация бизнеса, продажи, интеграции и поддержка 24/7. Студия Gerusta — профессиональные решения в экосистеме Telegram.",
  keywords: [
    "Telegram",
    "бот",
    "Telegram бот",
    "Mini App",
    "Telegram WebApp",
    "автоматизация",
    "разработка",
    "Next.js",
    "Nest.js",
    "боты для бизнеса",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Gerusta",
    title: "Gerusta — Telegram Bot Studio и Mini Apps",
    description:
      "Премиальная разработка Telegram-ботов и Mini Apps для бизнеса. Интеграции, оплаты, CRM и поддержка.",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerusta — Telegram Bot Studio и Mini Apps",
    description:
      "Премиальная разработка Telegram-ботов и Mini Apps для бизнеса. Интеграции, оплаты, CRM и поддержка.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
