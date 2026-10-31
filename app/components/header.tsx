import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

import LogoSvg from "./logoSvg"
import BackgroundStripes from "./backgroundStripes"
import HeaderNavigation from "./headerNavigation"

async function Header() {
  const { userId }: { userId: string | null } = await auth()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background">
      <div className="h-1 overflow-hidden opacity-55" aria-hidden>
        <BackgroundStripes />
      </div>
      <div className="mx-auto flex h-16 w-full max-w-[800px] items-center justify-between gap-4 px-4">
        <Link
          href="/"
          data-testid="logo-link-header"
          aria-label="Bolão.io"
          className="inline-flex min-h-11 shrink-0 items-center text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          <LogoSvg size={80} />
        </Link>
        <div className="min-w-0">
          <HeaderNavigation isSignedIn={Boolean(userId)} />
        </div>
      </div>
    </header>
  )
}

export default Header
