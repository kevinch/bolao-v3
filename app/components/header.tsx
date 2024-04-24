import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

import LogoSvg from "./logoSvg"
import Background from "./Background"

function Header() {
  const { userId }: { userId: string | null } = auth()

  return (
    <header>
      <Background />
      {userId ? <UserButton /> : <LogoSvg size={80} color="#666666" />}
    </header>
  )
}

export default Header
