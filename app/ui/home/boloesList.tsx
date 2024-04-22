"use client"

import Link from "next/link"
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
    return
  }

  if (data) {
    return (
      <div>
        {/* <pre>{userId}</pre> */}
        <div>
          {data.length > 0 ? (
            data.map((el: Bolao) => (
              <div key={el.id}>
                <h3>{el.name}</h3>
                <div>
                  <Link href={`/bolao/${el.id}/bet`}>Bet</Link>&nbsp;
                  <Link href={`/bolao/${el.id}/results`}>Results</Link>
                </div>
              </div>
            ))
          ) : (
            <button>create bolao</button>
          )}
        </div>
      </div>
    )
  }
}
