import Link from "next/link"
import Background from "./Background"

function Footer() {
  return (
    <footer style={{ margin: "100px 0 0 0" }}>
      <div className="footer_links" style={{ fontSize: "12px" }}>
        <Link href="/">Home</Link>&nbsp;
        <Link href="/bolao/create">Create Bolão</Link>&nbsp;
        <Link href="/about">About</Link>
      </div>
      <Background />
    </footer>
  )
}

export default Footer
