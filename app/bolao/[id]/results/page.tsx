import { getData } from "@/app/lib/controllerResults"
import { auth } from "@clerk/nextjs/server"
import { Suspense } from "react"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import Pagination from "@/app/ui/bolao/bet/pagination"
import TableMatchDayResults from "@/app/ui/bolao/results/tableMatchDayResults"
import {
  PaginationSkeleton,
  TableMatchDayResultsSkeleton,
} from "@/app/ui/skeletons"

async function ResultsPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: {
    roundIndex?: string
  }
}) {
  const { userId }: { userId: string | null } = auth()
  const roundIndex: string = searchParams?.roundIndex || ""

  if (!userId) {
    return <p>Error while loading the results page. Missing userid.</p>
  }

  const data = await getData({
    bolaoId: params.id,
    roundParam: roundIndex,
  })

  if (!data) {
    return <p>Error while loading the results page. No data.</p>
  }

  const currentRoundIndex =
    data.allRounds.findIndex(
      (el: string) => el.toLowerCase() === data.currentRound.toLowerCase()
    ) + 1

  return (
    <main>
      <BolaoPageTitle
        bolaoName={data.bolao.name}
        bolaoYear={data.bolao.year}
        leagueLogo={data.fixtures[0].league.logo}
        leagueName={data.fixtures[0].league.name}
      />

      <BolaoLinks bolaoId={data.bolao.id} active={3} />

      <Suspense fallback={<PaginationSkeleton />}>
        <Pagination
          isLastRound={data.isLastRound}
          isFirstRound={data.isFirstRound}
          currentRoundIndex={currentRoundIndex}
        />
      </Suspense>

      <Suspense fallback={<TableMatchDayResultsSkeleton />}>
        <TableMatchDayResults
          bets={data.bets}
          fixtures={data.fixtures}
          players={data.players}
          userId={userId}
        />
      </Suspense>
    </main>
  )
}

export default ResultsPage
