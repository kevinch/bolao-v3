import Link from "next/link"
import {
  fetchBolao,
  // fetchUserBoloes,
  getRounds,
  fetchFixtures,
} from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"
import TableMatchDayRegularSeason from "@/app/ui/bolao/bet/tableMatchDayRegularSeason"
// import TableMatchDayStages from "@/app/ui/bolao/bet/tableMatchDayStages"

async function getData(bolaoId: string, roundParam?: string) {
  const [bolao] = await Promise.all([
    fetchBolao(bolaoId),
    // fetchUserBoloes(bolaoId),
  ])

  const year = bolao.year // HAS TO GO TO STORE
  const leagueId = bolao.competition_id // HAS TO GO TO STORE

  const allRounds = await getRounds({ leagueId, year }) // HAS TO GO TO STORE
  const currentRoundObj = await getRounds({
    leagueId,
    year,
    current: true,
  }) // HAS TO GO TO STORE?
  const currentRound = currentRoundObj[0] // HAS TO GO TO STORE

  // We use round as an index because there are space in the round names
  let round = currentRound
  if (roundParam) {
    const index = Number(round)
    round = allRounds[index]
  }

  const fixtures = await fetchFixtures({
    leagueId,
    year,
    round,
  })

  return {
    bolao,
    // userBoloes,
    // competition,
    currentRound,
    allRounds,
    fixtures,
  }
}

async function Bet({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: {
    round?: string
  }
}) {
  // console.log("params", params)
  // console.log("searchParams", searchParams)
  const round: string = searchParams?.round || ""

  const data = await getData(params.id, round)

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

      {/* {isRegularSeason ? ( */}
      <TableMatchDayRegularSeason
        matches={data.fixtures}
        currentRound={data.currentRound}
        allRounds={data.allRounds}
      />
      {/* ) : (
        <TableMatchDayStages matches={data.matchesData.matches} />
      )} */}
    </main>
  )
}

export default Bet
