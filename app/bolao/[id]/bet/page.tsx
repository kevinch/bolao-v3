import Nav from "@/app/components/nav"

function Bet({ params }: { params: { id: string } }) {
  return (
    <main>
      <Nav />
      <h1>Bet Bolao {params.id}</h1>
    </main>
  )
}

export default Bet
