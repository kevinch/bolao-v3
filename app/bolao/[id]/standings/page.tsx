import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import TableStandings from "@/app/ui/bolao/standings/tableStandings"
import { getData } from "@/app/lib/controllerStandings"

async function StandingsPage({ params }: { params: { id: string } }) {
  const data = await getData(params.id)

  if (!data) {
    return <p>Error while loading the standings.</p>
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
