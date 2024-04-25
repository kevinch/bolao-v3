import type { Metadata } from "next"
import { IBM_Plex_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
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
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
