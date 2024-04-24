import { fetchBolao } from "@/app/lib/data"

async function getData(bolaoId: string) {
  const result = await fetchBolao(bolaoId)

  return result
}

async function Results({ params }: { params: { id: string } }) {
  const data = await getData(params.id)

  if (!data) {
    return <p>Error while loading the bolao.</p>
  }

  return (
    <main>
      <h1>{data.name}</h1>
      <pre>Competition Id: {data.competition_id}</pre>
    </main>
  )
}

export default Results
