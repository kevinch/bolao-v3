import type { Metadata } from "next"
import { IBM_Plex_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const Plex = IBM_Plex_Sans({ weight: "400", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bolão.io v3",
  description: "Free soccer bets with friends.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={Plex.className}>
          <div className="container mx-auto px-4">
            <Header />
            {children}
            <Footer />
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </div>
        </body>

        <Script
          async
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID}
        />
      </html>
    </ClerkProvider>
  )
}
