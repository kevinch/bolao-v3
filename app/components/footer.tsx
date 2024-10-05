import Link from "next/link"
import { Button } from "@/components/ui/button"
import BackgroundStripes from "./backgroundStripes"

function Footer() {
  return (
    <footer className="mt-20 text-sm">
      <div className="flex space-x-0 mb-4 justify-center">
        <Button asChild variant="ghost">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/bolao/create">Create bolão</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/about">About</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/news">News</Link>
        </Button>
      </div>
      <BackgroundStripes />
    </footer>
  )
}

export default Footer
