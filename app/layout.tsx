import type { Metadata } from "next"
import { IBM_Plex_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import JsonLd from "@/app/components/jsonLd"
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/app/lib/siteConfig"
import "./globals.css"

const Plex = IBM_Plex_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bolão.io — Free soccer betting pools with friends",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "bolão",
    "bolão online",
    "bolão grátis",
    "criar bolão",
    "soccer betting pool",
    "football prediction game",
    "World Cup pool",
    "Brasileirão",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Bolão.io — Free soccer betting pools with friends",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    alternateLocale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bolão.io — Free soccer betting pools with friends",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: ["en", "pt-BR"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

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
      <html lang={locale}>
        <head>
          <link rel="preconnect" href="https://clerk.bolao.io" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://media.api-sports.io" />
          <JsonLd data={websiteJsonLd} />
        </head>
        <body className={Plex.className}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="container mx-auto px-4">
              <Header />
              {children}
              <Footer />
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </div>
          </NextIntlClientProvider>
        </body>

        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID}
          strategy="lazyOnload"
        />
      </html>
    </ClerkProvider>
  )
}
