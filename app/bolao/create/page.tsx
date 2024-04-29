import Form from "@/app/ui/bolao/create/form"
import { getLeagues } from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"

async function CreateBolao() {
  const data = await getLeagues()

  return (
    <div>
      <PageTitle>Create bolão</PageTitle>

      <Form leagues={data} />
    </div>
  )
}

export default CreateBolao
