"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { SESSION_STORAGE_INVITE_KEY } from "@/app/lib/utils"
import { clearCompetition, consumeCompetition } from "@/app/lib/competitionIntent"

export default function InviteRedirector({ signedIn = false }: { signedIn?: boolean }) {
  const router = useRouter()

  useEffect(() => {
    let inviteLink: string | null
    try {
      inviteLink = sessionStorage.getItem(SESSION_STORAGE_INVITE_KEY)
    } catch {
      return
    }
    if (inviteLink && /^https?:\/\/.+/.test(inviteLink)) {
      // An invite takes priority over an earlier championship-card click.
      clearCompetition()
      if (
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        sessionStorage.removeItem(SESSION_STORAGE_INVITE_KEY)
        router.replace(inviteLink)
      }
      return
    }
    if (signedIn) {
      const competitionId = consumeCompetition()
      if (competitionId) router.replace(`/bolao/create?competitionId=${competitionId}`)
    }
  }, [router, signedIn])

  return null
}
