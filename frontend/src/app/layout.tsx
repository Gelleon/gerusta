import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
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
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

  return (
    <html lang="ru">
      <head>
        <link rel="mask-icon" href="/mask-icon.svg" color="#0088CC" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`}
            </Script>
          </>
        ) : null}
        {yandexMetrikaId ? (
          <>
            <Script id="ym-init" strategy="afterInteractive">
              {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");ym(${yandexMetrikaId}, "init", {clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
            </Script>
            <noscript>
              <div>
                <Image
                  src={`https://mc.yandex.ru/watch/${yandexMetrikaId}`}
                  width={1}
                  height={1}
                  unoptimized
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
