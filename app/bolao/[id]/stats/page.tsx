import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import StatsContent from "@/app/ui/bolao/stats/statsContent"
import { getData } from "@/app/lib/controllerStats"
import { requireBolaoAccess } from "@/app/lib/bolaoAccess"

async function StatsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { userId } = await auth()
  const t = await getTranslations("statsPage")

  if (!userId) {
    return <p>{t("errorMissingUser")}</p>
  }

  // Enforce membership before loading data. Kept out of the try/catch below so
  // the notFound() it may throw is not swallowed and renders a real 404.
  await requireBolaoAccess(params.id)

  let data
  try {
    data = await getData({
      bolaoId: params.id,
      userId,
      seasonEndLabel: t("seasonEnd"),
    })
  } catch (error) {
    console.error("Stats page load failed:", error)
    return <p>{t("errorLoadFailed")}</p>
  }

  if (!data || data.fixtures.length === 0) {
    return <p>{t("errorNoData")}</p>
  }

  return (
    <main>
      <BolaoPageTitle
        bolao={data.bolao}
        leagueLogo={data.fixtures[0].league.logo}
        leagueName={data.fixtures[0].league.name}
      />

      <BolaoLinks bolaoId={data.bolao.id} active={5} />

      <StatsContent stats={data.stats} />
    </main>
  )
}

export default StatsPage
