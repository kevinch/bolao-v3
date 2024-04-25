import Form from "@/app/ui/bolao/create/form"
import { getFootballData } from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"

async function CreateBolao() {
  const data = await getFootballData({ path: "competitions" })
  const competitions = data.competitions

  return (
    <div>
      <PageTitle>Create bolão</PageTitle>

      <Form data={competitions} />
    </div>
  )
}

export default CreateBolao
