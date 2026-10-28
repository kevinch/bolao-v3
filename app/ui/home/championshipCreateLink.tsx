"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { rememberCompetition } from "@/app/lib/competitionIntent"

export default function ChampionshipCreateLink({ competitionId, name, children, signedIn = false }: {
  competitionId: number
  name: string
  children: React.ReactNode
  signedIn?: boolean
}) {
  const t = useTranslations("homeMatches")
  return (
    <Link
      href={signedIn ? `/bolao/create?competitionId=${competitionId}` : `/sign-up?competitionId=${competitionId}`}
      prefetch={false}
      onClick={signedIn ? undefined : () => rememberCompetition(String(competitionId))}
      aria-label={t("createFor", { championship: name })}
      className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  )
}
