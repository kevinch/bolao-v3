"use client"

import PageTitle from "@/app/components/pageTitle"
import Image from "next/image"
import BolaoYearBadge from "@/app/components/bolaoYearBadge"
import { useState } from "react"
import type { Bolao } from "@/app/lib/definitions"

/** Temporary: tournament SVG (football-logos.cc) instead of API-Sports thumbnail for the 2026 tournament. */
const FIFA_WORLD_CUP_2026_LOGO =
  "/logos/tournaments_fifa-world-cup-2026.football-logos.cc.svg"

function is2026FifaWorldCup(bolao: Bolao, leagueName: string | undefined) {
  if (bolao.year !== 2026) return false
  if (bolao.competition_id === "1") return true
  const n = leagueName?.toLowerCase() ?? ""
  return /\bworld cup\b/.test(n) && !/\bclub\b/.test(n)
}

type Props = {
  bolao: Bolao
  leagueName?: string
  leagueLogo?: string
}

function BolaoPageTitle({ leagueName, leagueLogo, bolao }: Props) {
  const [failedLocalLogos, setFailedLocalLogos] = useState<Set<string>>(
    () => new Set()
  )
  const competitionId = bolao.competition_id
  const hasNumericCompetitionId = /^\d+$/.test(competitionId)
  const lightLocalLogo = hasNumericCompetitionId
    ? `/logos/leagues/${competitionId}-light.svg`
    : undefined
  const darkLocalLogo = hasNumericCompetitionId
    ? `/logos/leagues/${competitionId}-dark.svg`
    : undefined
  const hasLocalWorldCupPair =
    competitionId === "1" &&
    !failedLocalLogos.has("/logos/leagues/1-light.svg") &&
    !failedLocalLogos.has("/logos/leagues/1-dark.svg")
  const useWc2026Silhouette =
    is2026FifaWorldCup(bolao, leagueName) && !hasLocalWorldCupPair
  const lightLogoSrc = useWc2026Silhouette
    ? FIFA_WORLD_CUP_2026_LOGO
    : lightLocalLogo && !failedLocalLogos.has(lightLocalLogo)
      ? lightLocalLogo
      : leagueLogo
  const darkLogoSrc = useWc2026Silhouette
    ? lightLogoSrc
    : darkLocalLogo && !failedLocalLogos.has(darkLocalLogo)
      ? darkLocalLogo
      : lightLocalLogo && !failedLocalLogos.has(lightLocalLogo)
        ? lightLocalLogo
        : leagueLogo
  const logoWidth = useWc2026Silhouette ? 227 : 60
  const logoHeight = useWc2026Silhouette ? 351 : 60
  const logoClassName = useWc2026Silhouette
    ? "h-[4.5rem] w-auto"
    : "h-[60px] w-auto"
  const shouldTintLogoForDarkMode = darkLogoSrc === lightLogoSrc
  const handleLocalLogoError = (src: string | undefined) => {
    if (!src || failedLocalLogos.has(src)) return
    setFailedLocalLogos((current) => new Set(current).add(src))
  }
  const alt = `${leagueName ?? "2026 FIFA World Cup"}'s logo`

  return (
    <PageTitle center={true}>
      {lightLogoSrc && (
        <div className="flex justify-center mb-6">
          {darkLogoSrc && darkLogoSrc !== lightLogoSrc ? (
            <>
              <Image
                alt={alt}
                src={lightLogoSrc}
                width={logoWidth}
                height={logoHeight}
                className={`${logoClassName ?? ""} dark:hidden`}
                data-testid="league-logo"
                onError={() =>
                  handleLocalLogoError(
                    lightLogoSrc === lightLocalLogo ? lightLocalLogo : undefined
                  )
                }
              />
              <Image
                alt={alt}
                src={darkLogoSrc}
                width={logoWidth}
                height={logoHeight}
                className={`${logoClassName ?? ""} hidden dark:block`}
                data-testid="league-logo-dark"
                onError={() =>
                  handleLocalLogoError(
                    darkLogoSrc === darkLocalLogo ? darkLocalLogo : undefined
                  )
                }
              />
            </>
          ) : (
            <Image
              alt={alt}
              src={lightLogoSrc}
              width={logoWidth}
              height={logoHeight}
              className={`${logoClassName ?? ""} ${
                shouldTintLogoForDarkMode ? "dark:brightness-0 dark:invert" : ""
              }`}
              data-testid="league-logo"
              onError={() =>
                handleLocalLogoError(
                  lightLogoSrc === lightLocalLogo ? lightLocalLogo : undefined
                )
              }
            />
          )}
        </div>
      )}

      {bolao.name}
      <br />
      <span className="text-lg">
        {leagueName} <BolaoYearBadge bolao={bolao} />
        <br />
      </span>
    </PageTitle>
  )
}

export default BolaoPageTitle
