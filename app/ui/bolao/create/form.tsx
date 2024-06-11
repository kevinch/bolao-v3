"use client"

import { createBolao } from "@/app/lib/actions"
import clsx from "clsx"
import { buttonClasses } from "../../styles"

type League = {
  id: number
  name: string
  countryName: string
}

type FormProps = {
  leagues: League[]
}

function Form({ leagues }: FormProps) {
  return (
    <form action={createBolao}>
      <div className="mb-6">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Choose a name for your bolão"
          className="w-full"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="competition">Competition:</label>
        <select
          id="competition"
          name="competitionId"
          required
          className="w-full"
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
        <button type="submit" className={clsx(buttonClasses)}>
          Create
        </button>
      </div>
    </form>
  )
}

export default Form
