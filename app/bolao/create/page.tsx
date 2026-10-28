import { getTranslations } from "next-intl/server"
import Form from "@/app/ui/bolao/create/form"
import { fetchLeagues } from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"
import { supportedCompetitionId } from "@/app/lib/competitionIntent"

async function CreateBolao(props: {
  searchParams?: Promise<{ competitionId?: string | string[] }>
} = {}) {
  const params = await props.searchParams
  const competitionId = supportedCompetitionId(params?.competitionId)
  const data = await fetchLeagues()
  const t = await getTranslations("createBolao")

  return (
    <div>
      <PageTitle center={true}>
        <h1>{t("title")}</h1>
      </PageTitle>

      <Form leagues={data} competitionId={competitionId} />
    </div>
  )
}

export default CreateBolao
