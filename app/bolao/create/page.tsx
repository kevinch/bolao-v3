import Nav from "@/app/components/nav"
import { FOOTBALL_DATA_API } from "@/app/lib/utils"
import Form from "@/app/ui/bolao/create/form"

async function getData() {
  let token: string
  if (process.env.NEXT_PUBLIC_FOOTBALLDATA_TOKEN) {
    token = process.env.NEXT_PUBLIC_FOOTBALLDATA_TOKEN
  } else {
    throw new Error("FOOTBALLDATA_TOKEN environment variable is not set")
  }

  const myHeaders = new Headers()
  myHeaders.append("X-Auth-Token", token)

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  }

  const res = await fetch(`${FOOTBALL_DATA_API}/competitions`, requestOptions)

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data")
  }

  return res.json()
}

async function CreateBolao() {
  const data = await getData()
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
