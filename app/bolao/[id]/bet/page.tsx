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
import Pagination from "@/app/ui/bolao/bet/pagination"

async function getData(bolaoId: string, roundParam?: string) {
  const [bolao] = await Promise.all([
    fetchBolao(bolaoId),
    // fetchUserBoloes(bolaoId),
  ])

  const year = bolao.year
  const leagueId = bolao.competition_id

  const allRounds = await getRounds({ leagueId, year }) // MOCKED, HAS TO GO TO STORE
  const currentRoundObj = await getRounds({
    leagueId,
    year,
    current: true,
  }) // MOCKED, HAS TO GO TO STORE
  const currentRound = currentRoundObj[0] // HAS TO GO TO STORE

  let isFirstRound: boolean = false
  let isLastRound: boolean = false

  // We use round as an index because there are spaces in the round names
  let round = currentRound

  if (roundParam) {
    const index: number = Number(roundParam)
    round = allRounds[index]

    isFirstRound = Number(roundParam) === 0
    isLastRound = Number(roundParam) === allRounds.length - 1
  } else {
    isFirstRound = currentRound === allRounds[0]
    isLastRound = currentRound === allRounds[allRounds.length - 1]
  }

  const fixtures = await fetchFixtures({
    leagueId,
    year,
    round,
  })

  return {
    bolao,
    currentRound: round,
    allRounds,
    fixtures,
    isLastRound,
    isFirstRound,
  }
}

async function Bet({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: {
    roundIndex?: string
  }
}) {
  const roundIndex: string = searchParams?.roundIndex || ""

  const data = await getData(params.id, roundIndex)

  const currentRoundIndex = data.allRounds.findIndex(
    (el: string) => el.toLowerCase() === data.currentRound.toLowerCase()
  )

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
      <Pagination
        isLastRound={data.isLastRound}
        isFirstRound={data.isFirstRound}
        currentRound={data.currentRound}
        currentRoundIndex={currentRoundIndex}
      />
      <TableMatchDayRegularSeason matches={data.fixtures} />
      {/* ) : (
        <TableMatchDayStages matches={data.matchesData.matches} />
      )} */}
    </main>
  )
}

export default Bet
