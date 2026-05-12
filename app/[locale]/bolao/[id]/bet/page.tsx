import { getTranslations } from "next-intl/server"
import { getData } from "@/app/lib/controllerBet"
import { auth, clerkClient } from "@clerk/nextjs/server"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import Pagination from "@/app/ui/bolao/bet/pagination"
import TableMatchDayBets from "@/app/ui/bolao/bet/tableMatchDayBets"
import PlayerSelector from "@/app/ui/bolao/bet/playerSelector"

async function BetPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    roundIndex?: string
    userBolaoId?: string
  }>
}) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { userId }: { userId: string | null } = await auth()
  const roundIndex: string = searchParams?.roundIndex || ""
  const selectedUserBolaoId: string = searchParams?.userBolaoId || ""
  const t = await getTranslations("betPage")

  if (!userId) {
    return <p>{t("errorMissingUser")}</p>
  }

  const client = await clerkClient()
  const userData = await client.users.getUser(userId)
  const role = userData.privateMetadata?.role || "guest"
  const isAdmin = role === "admin"

  const data = await getData({
    bolaoId: params.id,
    roundParam: roundIndex,
    userId,
    isAdmin,
    selectedUserBolaoId,
  })

  if (!data) {
    return <p>{t("errorNoData")}</p>
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
        currentRoundName={data.currentRound}
      />

      {isAdmin && data.players.length > 0 && (
        <PlayerSelector
          players={data.players}
          selectedUserBolaoId={data.userBolao.id}
        />
      )}

      <TableMatchDayBets
        bets={data.bets}
        fixtures={data.fixtures}
        userBolaoId={data.userBolao.id}
        isAdmin={isAdmin}
      />
    </main>
  )
}

export default BetPage
