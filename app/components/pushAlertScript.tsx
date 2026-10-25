"use client"

import { useUser } from "@clerk/nextjs"
import Script from "next/script"

const PUSHALERT_SCRIPT_URL =
  "https://cdn.pushalert.co/integrate_b0aea8d8062166fd960b713c02407dfc.js"

export default function PushAlertScript({ testUserId }: { testUserId?: string }) {
  const { isLoaded, user } = useUser()

  if (!testUserId || !isLoaded || user?.id !== testUserId) {
    return null
  }

  return <Script src={PUSHALERT_SCRIPT_URL} strategy="afterInteractive" />
}
