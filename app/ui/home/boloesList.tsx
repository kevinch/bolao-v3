"use client"

import { fetchBoloes } from "@/app/lib/data"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"

type Bolao = {
  id: string
  name: string
  competition_id: string
}

export default function BoloesList() {
  const [data, setData] = useState([])
  const { isSignedIn, userId } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = userId && (await fetchBoloes(userId))

        setData(response)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [userId])

  if (!isSignedIn) {
    return <p>(nothing in BoloesList because logged out)</p>
  }

  if (data) {
    return (
      <div>
        <pre>{userId}</pre>
        <ul>
          {data.length > 0 ? (
            data.map((el: Bolao) => <li key={el.id}>{el.name}</li>)
          ) : (
            <button>create bolao</button>
          )}
        </ul>
      </div>
    )
  }
}
