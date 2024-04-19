import Nav from "@/app/components/nav"
// import { useEffect, useState } from "react"
// import axios from "axios"
import { Competition } from "@/app/lib/definitions"

async function getData() {
  const res = await fetch("https://api.football-data.org/v4/competitions")
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data")
  }

  return res.json()
}

async function CreateBolao() {
  const data = await getData()
  // const [data, setData] = useState([])
  // const [error, setError] = useState(null)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios({
  //         method: "get",
  //         url: "https://api.football-data.org/v4/competitions",
  //         headers: {
  //           "X-Auth-Token": process.env.NEXT_PUBLIC_FOOTBALLDATA_TOKEN,
  //         },
  //       })

  //       setData(response.data.competitions)
  //     } catch (error: any) {
  //       setError(error)
  //     }
  //   }

  //   fetchData()
  // }, [])

  return (
    <div>
      <Nav />

      <h1>Create bolão</h1>

      <form>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Choose a name for your bolão"
        />

        <label htmlFor="competition">Competition</label>
        <select id="competition">
          <option value="" disabled>
            Select a competition
          </option>
          {data.map((el: Competition) => (
            <option key={el.id} value={el.id}>
              {el.name}
            </option>
          ))}
        </select>
      </form>
    </div>
  )
}

export default CreateBolao
