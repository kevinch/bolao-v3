import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

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
        <body className={inter.className}>
          <div
            className="mobile_container"
            style={{ maxWidth: "500px", margin: "0 auto" }}
          >
            <Header />
            {children}
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
