import LogoSvg from "./logoSvg"
import Background from "./Background"

function Header() {
  return (
    <header>
      <Background />
      <LogoSvg size={80} color="#666666" />
    </header>
  )
}

export default Header
