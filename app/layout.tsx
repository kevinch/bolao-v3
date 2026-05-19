import type { Metadata } from "next"
import { IBM_Plex_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import Script from "next/script"

import { defaultLocale } from "@/i18n/config"

import "./globals.css"

const Plex = IBM_Plex_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Bolão.io v3",
  description: "Free soccer bets with friends.",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          footerAction: "hidden",
        },
        layout: {
          shimmer: false,
        },
      }}
    >
      <html lang={defaultLocale} suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://clerk.bolao.io" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link rel="dns-prefetch" href="https://media.api-sports.io" />
        </head>
        <body className={Plex.className}>
          {children}
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID}
            strategy="lazyOnload"
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
