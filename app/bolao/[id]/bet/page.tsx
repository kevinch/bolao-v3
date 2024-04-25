import { fetchBolao, fetchUserBoloes, getFootballData } from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"

async function getData(bolaoId: string) {
  const [bolao, userBoloes] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUserBoloes(bolaoId),
  ])

  const competitionId = bolao.competition_id

  const competition = await getFootballData({
    path: `competitions/${competitionId}`,
  })

  // if competition.currentSeason.stages.includes('REGULAR_SEASON')
  // then use competition.currentSeason.currentMatchday's value
  // for next request with competitions/{id}/matches?matchday={value}

  // else it's a championship with stages
  // for now we will get all matches at once with
  // competitions/{id}/matches

  const currentMatchday = competition.currentSeason.currentMatchday

  const matches = await getFootballData({
    path: `competitions/${competitionId}/matches?matchday=${currentMatchday}`,
  })

  return {
    bolao,
    userBoloes,
    competition,
    matches,
  }
}

async function Bet({ params }: { params: { id: string } }) {
  const data = await getData(params.id)

  if (!data) {
    return <p>Error while loading the bolao.</p>
  }

  return (
    <main>
      <PageTitle>{data.bolao.name}</PageTitle>

      {/* <pre>{JSON.stringify(data.matches, null, 4)}</pre> */}
    </main>
  )
}

export default Bet
