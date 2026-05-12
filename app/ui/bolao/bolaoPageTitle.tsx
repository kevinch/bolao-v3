import PageTitle from "@/app/components/pageTitle"
import Image from "next/image"
import BolaoYearBadge from "@/app/components/bolaoYearBadge"
import type { Bolao } from "@/app/lib/definitions"

/** Temporary: silhouette emblem (transparent) instead of API-Sports thumbnail for the 2026 tournament. */
const FIFA_WORLD_CUP_2026_SILHOUETTE_LOGO =
  "/logos/fwc-2026-emblem-without-trophy.svg"

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
  const useWc2026Silhouette = is2026FifaWorldCup(bolao, leagueName)
  const logoSrc = useWc2026Silhouette
    ? FIFA_WORLD_CUP_2026_SILHOUETTE_LOGO
    : leagueLogo

  return (
    <PageTitle center={true}>
      {logoSrc && (
        <div className="flex justify-center mb-6">
          {useWc2026Silhouette ? (
            <img
              src={logoSrc}
              alt={`${leagueName ?? "2026 FIFA World Cup"}'s logo`}
              width={47}
              height={72}
              className="h-[4.5rem] w-auto"
              data-testid="league-logo"
            />
          ) : (
            <Image
              alt={`${leagueName}'s logo`}
              src={logoSrc}
              width={60}
              height={60}
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
