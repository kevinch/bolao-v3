"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-transparent bg-background transition-shadow duration-200 ease-out motion-reduce:transition-none",
        scrolled &&
          "shadow-sm dark:border-border/70 dark:shadow-none"
      )}
    >
      {children}
    </header>
  )
}

export default HeaderShell
