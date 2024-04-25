import { fetchBolao } from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"

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
      <PageTitle>{data.name}</PageTitle>
      <pre>Competition Id: {data.competition_id}</pre>
    </main>
  )
}

export default Results
