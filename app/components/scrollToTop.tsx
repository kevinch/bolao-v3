"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * Scrolls back to the top of the page on forward navigations (Link clicks),
 * which Next's App Router does not reliably do for these routes (e.g. entering
 * a bolão or switching tabs while scrolled down). Browser back/forward
 * navigations are left untouched so their native scroll restoration still
 * works.
 *
 * Mounted once in the root layout so it survives the per-page remounts of the
 * route segments.
 */
function ScrollToTop() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)
  const isPopNavigation = useRef(false)

  useEffect(() => {
    function handlePopState() {
      isPopNavigation.current = true
      // Safety net: if this pop did not change the pathname (hash/query only),
      // clear the flag so a later forward navigation still scrolls to top. A
      // real forward Link click never happens within this window of a pop.
      window.setTimeout(() => {
        isPopNavigation.current = false
      }, 100)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    // Don't fight the browser's initial scroll / hash handling on first load.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Preserve native scroll restoration on browser back/forward.
    if (isPopNavigation.current) {
      isPopNavigation.current = false
      return
    }

    // Respect in-page anchor navigation.
    if (window.location.hash) return

    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return null
}

export default ScrollToTop
