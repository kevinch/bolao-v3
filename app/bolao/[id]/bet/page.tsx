import Link from "next/link"
import { fetchBolao, fetchUserBoloes, getFootballData } from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"
import TableMatchDayRegularSeason from "@/app/ui/bolao/bet/tableMatchDayRegularSeason"
import TableMatchDayStages from "@/app/ui/bolao/bet/tableMatchDayStages"
import { MatchesData } from "@/app/lib/definitions"

async function getData(bolaoId: string) {
  const [bolao, userBoloes] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUserBoloes(bolaoId),
  ])

  const competitionId = bolao.competition_id
  const competition = await getFootballData({
    path: `competitions/${competitionId}`,
  })

  // if competition.currentSeason.stages.includes('REGULAR_SEASON')
  // then use competition.currentSeason.currentMatchday's value for a smaller payload in the request
  let isRegularSeason = false
  if (competition.currentSeason.stages.includes("REGULAR_SEASON")) {
    isRegularSeason = true
  }

  // else it's a championship with stages
  // for now we will get all matches at once
  let path = `competitions/${competitionId}/matches`
  if (isRegularSeason) {
    const currentMatchday = competition.currentSeason.currentMatchday
    path += `?matchday=${currentMatchday}`
  }

  const matchesData: MatchesData = await getFootballData({ path })

  return {
    bolao,
    userBoloes,
    competition,
    matchesData,
  }
}

async function Bet({ params }: { params: { id: string } }) {
  const data = await getData(params.id)
  const isRegularSeason: boolean =
    data.competition.currentSeason.stages.includes("REGULAR_SEASON")

  if (!data) {
    return <p>Error while loading the bolão.</p>
  }

  return (
    <main>
      <div className="text-right">
        <Link
          className="underline hover:no-underline"
          href={`/bolao/${params.id}/results`}
        >
          results
        </Link>
      </div>

      <PageTitle>{data.bolao.name}</PageTitle>

      {/* TODO: add later */}
      {/* <div className="text-center mb-10">
        Current round: {data.competition.currentSeason.currentMatchday}
      </div> */}

      {isRegularSeason ? (
        <TableMatchDayRegularSeason matches={data.matchesData.matches} />
      ) : (
        <TableMatchDayStages matches={data.matchesData.matches} />
      )}
    </main>
  )
}

export default Bet
