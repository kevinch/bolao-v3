import { getTranslations } from "next-intl/server"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import TableStandings from "@/app/ui/bolao/standings/tableStandings"
import { getData } from "@/app/lib/controllerStandings"

async function StandingsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const t = await getTranslations("standingsPage")
  const data = await getData(params.id)

  if (!data) {
    return <p>{t("error")}</p>
  }

  return (
    <main>
      <BolaoPageTitle
        bolao={data.bolao}
        leagueLogo={data.standingsLeague.logo}
        leagueName={data.standingsLeague.name}
      />

      <BolaoLinks bolaoId={data.bolao.id} active={2} />

      <TableStandings standingsLeague={data.standingsLeague} />
    </main>
  )
}

export default StandingsPage
