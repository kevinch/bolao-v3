import Link from "next/link"

import LogoSvg from "./logoSvg"
import BackgroundStripes from "./backgroundStripes"
import HeaderUserActions from "./headerUserActions"

function Header() {
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
        <div className="content-center">
          <HeaderUserActions />
        </div>
      </div>
    </header>
  )
}

export default Header
