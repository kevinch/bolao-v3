import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

import LogoSvg from "./logoSvg"
import BackgroundStripes from "./backgroundStripes"
import UserButtonWrapper from "./userButtonWrapper"

async function Header() {
  const { userId }: { userId: string | null } = await auth()

  return (
    <header>
      <BackgroundStripes />
      <div className="flex justify-between mt-6">
        <div className="content-center">
          <Link
            href={"/"}
            data-testid="logo-link-header"
            className="inline-block text-muted-foreground transition-colors duration-150 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground"
          >
            <LogoSvg size={80} />
          </Link>
        </div>
        <div className="content-center">{userId && <UserButtonWrapper />}</div>
      </div>
    </header>
  )
}

export default Header
