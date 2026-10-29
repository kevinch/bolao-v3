"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import TeamCodeLogo from "@/app/ui/bolao/teamCodeLogo"
import FixtureDate from "@/app/ui/bolao/fixtureDate"
import { isFixtureOpenToBet } from "@/app/lib/utils"
import type { PreviewMatch } from "@/app/lib/homeMatches"
import { ArrowRightIcon } from "@radix-ui/react-icons"

export default function MatchPreview({ matches, bolaoId }: {
  matches: PreviewMatch[]
  bolaoId?: string
}) {
  const t = useTranslations("homeMatches")
  const locale = useLocale()
  const [, setTick] = useState(0)

  useEffect(() => {
    // Remove expired actions even when someone leaves the homepage open.
    const timer = window.setInterval(() => setTick((tick) => tick + 1), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const openMatches = matches.filter((match) => isFixtureOpenToBet(match.fixture))
  if (!openMatches.length) {
    return <p className="px-4 py-5 text-sm text-muted-foreground">{t("noUpcoming")}</p>
  }

  return (
    <ul>
      {openMatches.map(({ fixture: match, incomplete, roundIndex }, index) => (
        <li key={match.fixture.id} className={`border-t border-border px-3 py-4 first:border-t-0 ${index > 0 ? "hidden md:list-item" : ""}`}>
          <div className="flex items-center justify-center">
            <TeamCodeLogo name={match.teams.home.name} logoSrc={match.teams.home.logo} />
            <div className="min-w-0 flex-1 text-center">
              <span className="mb-1 block text-xs text-muted-foreground" aria-hidden="true">×</span>
              <FixtureDate timestamp={match.fixture.timestamp} status={match.fixture.status} locale={locale} />
            </div>
            <TeamCodeLogo name={match.teams.away.name} logoSrc={match.teams.away.logo} />
          </div>
          {bolaoId && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className={incomplete
                ? "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                : "text-xs text-muted-foreground"}>
                {t(incomplete ? "incomplete" : "missing")}
              </span>
              <Link
                href={`/bolao/${bolaoId}/bet?roundIndex=${roundIndex}`}
                className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                aria-label={t("predictMatch", { home: match.teams.home.name, away: match.teams.away.name })}
              >
                {t("predict")}<ArrowRightIcon aria-hidden="true" />
              </Link>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
