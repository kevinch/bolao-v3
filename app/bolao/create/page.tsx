import Form from "@/app/ui/bolao/create/form"
import { fetchLeagues } from "@/app/lib/data"
import { supportedCompetitionId } from "@/app/lib/competitionIntent"

async function CreateBolao(
  props: {
    searchParams?: Promise<{ competitionId?: string | string[] }>
  } = {}
) {
  const params = await props.searchParams
  const competitionId = supportedCompetitionId(params?.competitionId)
  const data = await fetchLeagues()
  return <Form leagues={data} competitionId={competitionId} />
}

export default CreateBolao
