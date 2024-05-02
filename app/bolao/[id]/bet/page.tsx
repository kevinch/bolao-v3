import Link from "next/link"
import {
  fetchBolao,
  fetchUserBoloes,
  fetchRounds,
  fetchFixtures,
} from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"
import TableMatchDay from "@/app/ui/bolao/bet/tableMatchDay"
import Pagination from "@/app/ui/bolao/bet/pagination"
import { sortFixtures, cleanRounds } from "@/app/lib/utils"

async function getData(bolaoId: string, roundParam?: string) {
  const [bolao] = await Promise.all([
    fetchBolao(bolaoId),
    // fetchUserBoloes(bolaoId),
  ])

  const year: number = bolao.year
  const leagueId = bolao.competition_id

  const allRoundsUncleaned: string[] = await fetchRounds({ leagueId, year }) // HAS TO GO TO STORE
  const allRounds: string[] = cleanRounds(allRoundsUncleaned)

  const currentRoundObj: string[] = await fetchRounds({
    leagueId,
    year,
    current: true,
  }) // HAS TO GO TO STORE
  const currentRound = currentRoundObj[0] // HAS TO GO TO STORE

  let isFirstRound: boolean = false
  let isLastRound: boolean = false

  // PARAM HANDLING FOR PAGINATION
  // We use round as an index because there are spaces in the round names
  let round = currentRound

  if (roundParam) {
    const index: number = Number(roundParam) - 1
    round = allRounds[index]

    isFirstRound = Number(roundParam) === 1
    isLastRound = Number(roundParam) === allRounds.length
  } else {
    isFirstRound = currentRound === allRounds[0]
    isLastRound = currentRound === allRounds[allRounds.length - 1]
  }
  // END

  const unSortedFixtures = await fetchFixtures({
    leagueId,
    year,
    round,
  })
  const fixtures = sortFixtures(unSortedFixtures)

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

  const currentRoundIndex =
    data.allRounds.findIndex(
      (el: string) => el.toLowerCase() === data.currentRound.toLowerCase()
    ) + 1

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

      <Pagination
        isLastRound={data.isLastRound}
        isFirstRound={data.isFirstRound}
        currentRoundIndex={currentRoundIndex}
      />
      <TableMatchDay matches={data.fixtures} />
    </main>
  )
}

export default Bet
