"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Module-level flag so a scroll request survives components that unmount during
// a route change (e.g. the per-page bolão tab bar). It is only ever set by a
// forward Link click that opts in via requestScrollToTop(), so browser
// back/forward keep their native scroll restoration, and navigations that have
// their own scroll handling (the header) are left untouched.
let pendingScrollToTop = false

export function requestScrollToTop() {
  pendingScrollToTop = true
}

/**
 * Persistent listener mounted once in the root layout. When a navigation was
 * requested via requestScrollToTop(), it scrolls to the top of the page after
 * the new route renders. Opt-in only — it does nothing for navigations that
 * did not call requestScrollToTop().
 */
function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pendingScrollToTop) return

    pendingScrollToTop = false
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return null
}

export default ScrollToTop
