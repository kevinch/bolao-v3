import { getTranslations } from "next-intl/server"
import Form from "@/app/ui/bolao/create/form"
import { fetchLeagues } from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"

async function CreateBolao() {
  const data = await fetchLeagues()
  const t = await getTranslations("createBolao")

  return (
    <div>
      <PageTitle center={true}>
        <h1>{t("title")}</h1>
      </PageTitle>

      <Form leagues={data} />
    </div>
  )
}

export default CreateBolao
