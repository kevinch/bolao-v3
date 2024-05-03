import { fetchBolao } from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"
import BolaoLinks from "@/app/ui/bolao/bolaoLinks"

async function getData(bolaoId: string) {
  const bolao = await fetchBolao(bolaoId)

  return { bolao }
}

async function ResultsPage({ params }: { params: { id: string } }) {
  const data = await getData(params.id)

  if (!data) {
    return <p>Error while loading the bolao.</p>
  }

  return (
    <main>
      <PageTitle center={true} subTitle={data.bolao.year}>
        {data.bolao.name}
      </PageTitle>

      <BolaoLinks bolaoId={data.bolao.id} active={3} />
    </main>
  )
}

export default ResultsPage
