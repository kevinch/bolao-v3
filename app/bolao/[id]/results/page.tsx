"use client"

import Nav from "@/app/components/nav"
import { fetchBolao } from "@/app/lib/data"
import { useEffect, useState } from "react"

interface Bolao {
  name: string
  id: string
  competition_id: string
}

function Results({ params }: { params: { id: string } }) {
  const [data, setData] = useState<Bolao>({
    name: "",
    id: "",
    competition_id: "",
  })
  const bolaoId = params.id

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: Bolao = await fetchBolao(bolaoId)

        setData(response)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  if (!data) {
    return <p>Error while loading the bolao.</p>
  }

  return (
    <main>
      <Nav />
      <h1>{data.name}</h1>
      <pre>Competition id: {data.competition_id}</pre>
    </main>
  )
}

export default Results
