"use client"

import { createBolao } from "@/app/lib/actions"
import clsx from "clsx"
import { buttonClasses } from "../../styles"
import { useState } from "react"

type League = {
  id: number
  name: string
  countryName: string
}

type FormProps = {
  leagues: League[]
}

function Form({ leagues }: FormProps) {
  const [name, setName] = useState("")
  const [competitionId, setCompetitionId] = useState(0)
  const [result, setResult] = useState(false)

  async function submit() {
    console.log("submit")
    const result = await createBolao({ name, competitionId })
    if (result.success) {
      setResult(true)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Choose a name for your bolão"
          className="w-full"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="competition">Competition:</label>
        <select
          id="competition"
          name="competitionId"
          required
          className="w-full"
          onChange={(e) => setCompetitionId(Number(e.target.value))}
        >
          <option value="" disabled>
            Select a competition
          </option>
          {leagues.map((el: League) => (
            <option key={el.id} value={el.id}>
              {el.name} - {el.countryName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button onClick={submit} className={clsx(buttonClasses)}>
          Create
        </button>
      </div>

      {result && <div>Bolão created ✔</div>}
    </div>
  )
}

export default Form
