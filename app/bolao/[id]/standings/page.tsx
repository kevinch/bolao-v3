import { fetchBolao, fetchStandings } from "@/app/lib/data"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import { StandingsLeague } from "@/app/lib/definitions"

import TableStandings from "@/app/ui/bolao/standings/tableStandings"

async function getData(bolaoId: string) {
  const bolao = await fetchBolao(bolaoId)

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  const standingsLeague: StandingsLeague = await fetchStandings({
    leagueId,
    year,
  })

  return { bolao, standingsLeague }
}

async function StandingsPage({ params }: { params: { id: string } }) {
  const data = await getData(params.id)

  if (!data) {
    return <p>Error while loading the standings.</p>
  }

  return (
    <main>
      <BolaoPageTitle
        bolaoName={data.bolao.name}
        bolaoYear={data.bolao.year}
        leagueLogo={data.standingsLeague.logo}
        leagueName={data.standingsLeague.name}
      />

      <BolaoLinks bolaoId={data.bolao.id} active={2} />

      <TableStandings standingsLeague={data.standingsLeague} />
    </main>
  )
}

export default StandingsPage
