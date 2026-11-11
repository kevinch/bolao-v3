import { StandingsLeague } from "@/app/lib/definitions"
import { fetchBolao, fetchStandings } from "@/app/lib/data"
import { requireBolaoAccess } from "./bolaoAccess"

export async function getData(bolaoId: string) {
  await requireBolaoAccess(bolaoId)

  const bolao = await fetchBolao(bolaoId)

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  const standingsLeague: StandingsLeague = await fetchStandings({
    leagueId,
    year,
  })

  return { bolao, standingsLeague }
}
