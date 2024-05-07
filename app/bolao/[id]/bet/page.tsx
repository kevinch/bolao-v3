import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import TableMatchDay from "@/app/ui/bolao/bet/tableMatchDay"
import Pagination from "@/app/ui/bolao/bet/pagination"
import { auth } from "@clerk/nextjs/server"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import { getData } from "@/app/lib/controllerBetResults"

async function BetPage({
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
        bolaoName={data.bolao.name}
        bolaoYear={data.bolao.year}
        leagueLogo={data.fixtures[0].league.logo}
        leagueName={data.fixtures[0].league.name}
      />

      <BolaoLinks bolaoId={data.bolao.id} active={1} />

      <Pagination
        isLastRound={data.isLastRound}
        isFirstRound={data.isFirstRound}
        currentRoundIndex={currentRoundIndex}
      />

      <TableMatchDay
        bets={data.bets}
        fixtures={data.fixtures}
        userBolaoId={data.userBolao.id}
      />
    </main>
  )
}

export default BetPage
