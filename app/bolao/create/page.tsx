import Nav from "@/app/components/nav"
import Form from "@/app/ui/bolao/create/form"
import { getFootballData } from "@/app/lib/data"

async function CreateBolao() {
  const data = await getFootballData({ path: "competitions" })
  const competitions = data.competitions

  return (
    <div>
      <Nav />

      <h1>Create bolão</h1>

      <Form data={competitions} />
    </div>
  )
}

export default CreateBolao
