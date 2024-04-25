import Link from "next/link"
import Background from "./Background"

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
      </div>
      <Background />
    </footer>
  )
}

export default Footer
