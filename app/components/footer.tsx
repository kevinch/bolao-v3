import Link from "next/link"
import Background from "./Background"

function Footer() {
  return (
    <footer>
      <div className="footer_links" style={{ fontSize: "12px" }}>
        <Link href="/">Home</Link>&nbsp;
        <Link href="/about">About</Link>
      </div>
      <Background />
    </footer>
  )
}

export default Footer
