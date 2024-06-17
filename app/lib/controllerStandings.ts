import { StandingsLeague } from "@/app/lib/definitions"
import { unstable_noStore as noStore } from "next/cache"
import { fetchBolao, fetchStandings } from "@/app/lib/data"

export async function getData(bolaoId: string) {
  noStore()

  const bolao = await fetchBolao(bolaoId)

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  const standingsLeague: StandingsLeague = await fetchStandings({
    leagueId,
    year,
  })

  return { bolao, standingsLeague }
}
