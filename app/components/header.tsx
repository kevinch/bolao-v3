import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

import LogoSvg from "./logoSvg"
import Background from "./Background"

function Header() {
  const { userId }: { userId: string | null } = auth()

  return (
    <header>
      <Background />
      <div className="flex justify-between mt-6">
        <div>
          <Link href={"/"}>
            <LogoSvg size={80} color="#666666" />
          </Link>
        </div>
        <div>{userId && <UserButton />}</div>
      </div>
    </header>
  )
}

export default Header
