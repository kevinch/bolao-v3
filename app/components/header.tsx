import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

import LogoSvg from "./logoSvg"
import BackgroundStripes from "./backgroundStripes"
import HeaderNavigation from "./headerNavigation"
import HeaderShell from "./headerShell"

async function Header() {
  const { userId }: { userId: string | null } = await auth()

  return (
    <HeaderShell>
      <div aria-hidden>
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
    </HeaderShell>
  )
}

export default Header
