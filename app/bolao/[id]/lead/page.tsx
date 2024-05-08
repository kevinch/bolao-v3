import TableLead from "@/app/ui/bolao/lead/tableLead"
import { calcLead } from "@/app/lib/calcLeadFactory"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import { getData } from "@/app/lib/controllerLead"

async function LeadPage({ params }: { params: { id: string } }) {
  const data = await getData({ bolaoId: params.id })

  const unsortedLead = calcLead({
    players: data.players,
    fixtures: data.fixtures,
    bets: data.bets,
  })
  const sortedLead = [...unsortedLead].sort((a, b) => b.total - a.total)

  return (
    <main>
      <BolaoPageTitle
        bolaoName={data.bolao.name}
        bolaoYear={data.bolao.year}
        // leagueLogo={data.standingsLeague.logo}
        // leagueName={data.standingsLeague.name}
      />

      <BolaoLinks bolaoId={data.bolao.id} active={4} />

      <TableLead data={sortedLead} />
    </main>
  )
}

export default LeadPage
