import TableLead from "@/app/ui/bolao/lead/tableLead"
import { calcLead } from "@/app/lib/calcLeadFactory"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"
import { getData } from "@/app/lib/controllerLead"
import { LeadData } from "@/app/lib/definitions"

async function LeadPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await getData({ bolaoId: params.id })

  const unsortedLead: LeadData[] = calcLead({
    players: data.players,
    fixtures: data.fixtures,
    bets: data.bets,
  })
  const sortedLead = [...unsortedLead].sort((a, b) => b.total - a.total)

  return (
    <main>
      <BolaoPageTitle
        bolao={data.bolao}
        leagueLogo={data.fixtures[0].league.logo}
        leagueName={data.fixtures[0].league.name}
      />

      <BolaoLinks bolaoId={data.bolao.id} active={4} />

      <TableLead data={sortedLead} />
    </main>
  )
}

export default LeadPage
