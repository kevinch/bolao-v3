import PageTitle from "@/app/components/pageTitle"
import Image from "next/image"
import BolaoYearBadge from "@/app/components/bolaoYearBadge"
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
  const useWc2026Silhouette = is2026FifaWorldCup(bolao, leagueName)
  const logoSrc = useWc2026Silhouette ? FIFA_WORLD_CUP_2026_LOGO : leagueLogo

  return (
    <PageTitle center={true}>
      {logoSrc && (
        <div className="flex justify-center mb-6">
          <Image
            alt={`${leagueName ?? "2026 FIFA World Cup"}'s logo`}
            src={logoSrc}
            width={useWc2026Silhouette ? 227 : 60}
            height={useWc2026Silhouette ? 351 : 60}
            className={useWc2026Silhouette ? "h-[4.5rem] w-auto" : undefined}
            data-testid="league-logo"
          />
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
