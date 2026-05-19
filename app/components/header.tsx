"use client"

import { useAuth } from "@clerk/nextjs"

import { Link } from "@/i18n/navigation"

import BackgroundStripes from "./backgroundStripes"
import LogoSvg from "./logoSvg"
import UserButtonWrapper from "./userButtonWrapper"

export default function Header() {
  const { isLoaded, userId } = useAuth()

  return (
    <header>
      <BackgroundStripes />
      <div className="flex justify-between mt-6">
        <div className="content-center">
          <Link
            href="/"
            data-testid="logo-link-header"
            className="inline-block text-muted-foreground transition-colors duration-150 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground"
          >
            <LogoSvg size={80} />
          </Link>
        </div>
        <div className="content-center">
          {isLoaded && userId ? <UserButtonWrapper /> : null}
        </div>
      </div>
    </header>
  )
}
