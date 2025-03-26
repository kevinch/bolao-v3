import { getData } from "@/app/lib/controllerBet"
import { auth } from "@clerk/nextjs/server"

import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import Pagination from "@/app/ui/bolao/bet/pagination"
import TableMatchDayBets from "@/app/ui/bolao/bet/tableMatchDayBets"

async function BetPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    roundIndex?: string
  }>
}) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { userId }: { userId: string | null } = await auth()
  const roundIndex: string = searchParams?.roundIndex || ""

  if (!userId) {
    return <p>Error while loading the bet page. Missing userid.</p>
  }

  const data = await getData({
    bolaoId: params.id,
    roundParam: roundIndex,
    userId,
  })

  if (!data) {
    return <p>Error while loading the bet page. No data.</p>
  }

  const currentRoundIndex =
    data.allRounds.findIndex(
      (el: string) => el.toLowerCase() === data.currentRound.toLowerCase()
    ) + 1

  return (
    <main>
      <BolaoPageTitle
        bolao={data.bolao}
        leagueLogo={data.fixtures[0].league.logo}
        leagueName={data.fixtures[0].league.name}
      />

      <BolaoLinks bolaoId={data.bolao.id} active={1} />

      <Pagination
        isLastRound={data.isLastRound}
        isFirstRound={data.isFirstRound}
        currentRoundIndex={currentRoundIndex}
      />

      <TableMatchDayBets
        bets={data.bets}
        fixtures={data.fixtures}
        userBolaoId={data.userBolao.id}
      />
    </main>
  )
}

export default BetPage
