import { StandingsLeague } from "@/app/lib/definitions"
import { fetchBolao, fetchStandings } from "@/app/lib/data"

export async function getData(bolaoId: string) {
  const bolao = await fetchBolao(bolaoId)

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  const standingsLeague: StandingsLeague = await fetchStandings({
    leagueId,
    year,
  })

  return { bolao, standingsLeague }
}
