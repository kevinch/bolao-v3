"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { SESSION_STORAGE_INVITE_KEY } from "@/app/lib/utils"

export default function InviteRedirector() {
  const router = useRouter()

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      const inviteLink = sessionStorage.getItem(SESSION_STORAGE_INVITE_KEY)
      if (inviteLink && /^https?:\/\/.+/.test(inviteLink)) {
        sessionStorage.removeItem(SESSION_STORAGE_INVITE_KEY)
        router.replace(inviteLink)
      }
    }
  }, [router])

  return null
}
