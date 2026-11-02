import Link from "next/link"
import { getTranslations } from "next-intl/server"
import {
  fetchBolao,
  fetchFixtures,
  fetchLeague,
  fetchRounds,
  fetchUserBolao,
} from "@/app/lib/data"
import { auth } from "@clerk/nextjs/server"
import { createUserBolao } from "@/app/lib/actions"
import { Button } from "@/components/ui/button"
import PageTitle from "@/app/components/pageTitle"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import NextGames from "@/app/ui/bolao/nextGames"
import { cleanRounds } from "@/app/lib/utils"
import { upcomingMatches, type PreviewMatch } from "@/app/lib/homeMatches"

async function getData({
  bolaoId,
  userId,
}: {
  bolaoId: string
  userId: string
}) {
  const [bolao, userBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUserBolao({ bolaoId, userId }),
  ])

  let resultKey = "alreadyIn"

  if (!userBolao) {
    const data = await createUserBolao(bolaoId)

    if (data.success) {
      resultKey = "added"
    } else {
      resultKey = "addError"
    }
  }

  let matches: PreviewMatch[] = []
  let leagueName: string | undefined
  let leagueLogo: string | undefined

  try {
    const leagueId = bolao.competition_id
    const [league, fixtures, rounds] = await Promise.all([
      fetchLeague(Number(leagueId)),
      fetchFixtures({ leagueId, year: bolao.year }),
      fetchRounds({ leagueId, year: bolao.year }),
    ])
    const previewMatches = upcomingMatches(fixtures, cleanRounds(rounds)).slice(
      0,
      3
    )
    matches = previewMatches
    leagueName = previewMatches[0]?.fixture.league.name ?? league?.league?.name
    leagueLogo = previewMatches[0]?.fixture.league.logo ?? league?.league?.logo
  } catch {
    // The invite should remain usable even when match data is temporarily unavailable.
  }

  return { bolao, resultKey, matches, leagueName, leagueLogo }
}

async function InvitePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { userId }: { userId: string | null } = await auth()

  if (!userId) {
    const t = await getTranslations("invitePage")
    return <p>{t("missingUser")}</p>
  }

  const t = await getTranslations("invitePage")
  const data = await getData({ bolaoId: params.id, userId })

  if (!data) {
    return <p>{t("error")}</p>
  }

  return (
    <main>
      <PageTitle center>
        <h1>{t("title")}</h1>
      </PageTitle>
      <BolaoPageTitle
        bolao={data.bolao}
        leagueLogo={data.leagueLogo}
        leagueName={data.leagueName}
        className="mt-0 mb-8"
      />

      <p
        role="status"
        aria-live="polite"
        className={`mx-auto mb-8 max-w-xl rounded-lg border px-4 py-3 text-center font-medium ${
          data.resultKey === "added" || data.resultKey === "alreadyIn"
            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
            : data.resultKey === "addError"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              : "border-border bg-muted/30 text-muted-foreground"
        }`}
      >
        {t(data.resultKey)}
      </p>

      <NextGames
        title={t("nextGames")}
        matches={data.matches}
        bolaoId={data.bolao.id}
      />

      <p className="text-center">
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/bolao/${data.bolao.id}/bet`}>{t("startBetting")}</Link>
        </Button>
      </p>
    </main>
  )
}

export default InvitePage
