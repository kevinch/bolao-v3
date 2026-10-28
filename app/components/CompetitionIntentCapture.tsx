"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { rememberCompetition } from "@/app/lib/competitionIntent"

/** Also captures a directly opened signup URL, not just clicks on the homepage. */
export default function CompetitionIntentCapture() {
  const params = useSearchParams()
  const competitionId = params.get("competitionId")
  useEffect(() => {
    rememberCompetition(competitionId)
  }, [competitionId])
  return null
}
