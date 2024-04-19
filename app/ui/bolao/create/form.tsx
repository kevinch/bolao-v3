"use client"

import { Competition } from "@/app/lib/definitions"
import { createBolao } from "@/app/lib/actions"

function Form({ data }: { data: Competition[] }) {
  return (
    <form action={createBolao}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Choose a name for your bolão"
        />
      </div>

      <div>
        <label htmlFor="competition">Competition</label>
        <select id="competition" name="competitionId" required>
          <option value="" disabled>
            Select a competition
          </option>
          {data.map((el: Competition) => (
            <option key={el.id} value={el.id}>
              {el.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button type="submit">Create</button>
      </div>
    </form>
  )
}

export default Form
