"use client"

import { forwardRef } from "react"
import Link from "next/link"
import type { ComponentProps } from "react"
import { requestScrollToTop } from "@/app/components/scrollToTop"

type ScrollLinkProps = ComponentProps<typeof Link>

/**
 * A next/link that scrolls back to the top of the page on navigation. Used for
 * entering a bolão (home cards) and switching bolão tabs, where the App Router
 * does not reliably scroll to top. forwardRef + prop spreading let it work as a
 * Radix Slot child (Button asChild).
 */
const ScrollLink = forwardRef<HTMLAnchorElement, ScrollLinkProps>(
  function ScrollLink({ onNavigate, ...props }, ref) {
    return (
      <Link
        ref={ref}
        {...props}
        onNavigate={(event) => {
          requestScrollToTop()
          onNavigate?.(event)
        }}
      />
    )
  }
)

export default ScrollLink
