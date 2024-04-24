import Link from "next/link"
import Background from "./Background"

function Footer() {
  return (
    <footer className="mt-8 text-sm">
      <div className="footer_links">
        <Link href="/">Home</Link>&nbsp;
        <Link href="/bolao/create">Create Bolão</Link>&nbsp;
        <Link href="/about">About</Link>
      </div>
      <Background />
    </footer>
  )
}

export default Footer
