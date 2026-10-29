"use client"

import { useState } from "react"
import Image from "next/image"
import { GlobeIcon } from "@radix-ui/react-icons"

// Reuse the app's existing championship artwork, including theme variants.
const localLogos = new Set([1, 2, 13, 15, 39, 61, 66, 71, 72, 73, 75, 94, 140])
const darkLogos = new Set([1, 2, 39, 61, 66, 71, 72, 75, 94])

type Props = {
  competitionId: number
  season: number
  logoSrc?: string
}

export default function ChampionshipLogo({ competitionId, season, logoSrc }: Props) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const hasLocal = localLogos.has(competitionId) && (competitionId !== 1 || season === 2026)
  const light = hasLocal ? `/logos/leagues/${competitionId}-light.svg` : undefined
  const dark = hasLocal && darkLogos.has(competitionId)
    ? `/logos/leagues/${competitionId}-dark.svg` : undefined
  const usable = (src?: string) => src && !failed.has(src) ? src : undefined
  const lightSrc = usable(light) ?? usable(logoSrc)
  const darkSrc = usable(dark) ?? lightSrc
  const onError = (src: string) => setFailed((current) => new Set(current).add(src))

  function logo(src: string, className = "") {
    return (
      <span className={`h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-black/5 p-1.5 ${className} ${src === dark ? "bg-zinc-900" : "bg-white"}`}>
        <Image src={src} alt="" width={40} height={40}
          className="h-10 w-10 shrink-0 object-contain" onError={() => onError(src)} />
      </span>
    )
  }

  // The neighboring championship name already labels this decorative artwork.
  return (
    <div aria-hidden="true" className="shrink-0">
      {lightSrc && darkSrc && lightSrc !== darkSrc ? (
        <>{logo(lightSrc, "flex dark:hidden")}{logo(darkSrc, "hidden dark:flex")}</>
      ) : lightSrc || darkSrc ? (
        logo((lightSrc ?? darkSrc)!, "flex")
      ) : (
        <span className="flex h-14 w-14 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
          <GlobeIcon className="h-6 w-6" />
        </span>
      )}
    </div>
  )
}
