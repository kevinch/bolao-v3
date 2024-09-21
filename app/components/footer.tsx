import Link from "next/link"
import Background from "./background"

function Footer() {
  return (
    <footer className="mt-28 text-sm">
      <div className="flex space-x-4 justify-center">
        <Link className="underline hover:no-underline" href="/">
          Home
        </Link>
        <Link className="underline hover:no-underline" href="/bolao/create">
          Create Bolão
        </Link>
        <Link className="underline hover:no-underline" href="/about">
          About
        </Link>
        <Link className="underline hover:no-underline" href="/news">
          News
        </Link>
      </div>
      <Background />
    </footer>
  )
}

export default Footer
