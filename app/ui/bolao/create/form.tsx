"use client"

import { createBolao } from "@/app/lib/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { League } from "@/app/lib/definitions"

type FormProps = {
  leagues: League[]
}

function Form({ leagues }: FormProps) {
  const orderedLeaguesByCountryName = Object.values(
    leagues.reduce(
      (acc, competition) => {
        const { countryName } = competition
        if (!acc[countryName]) {
          acc[countryName] = []
        }
        acc[countryName].push(competition)
        return acc
      },
      {} as { [key: string]: League[] }
    )
  )

  // Sorting the inner arrays by 'name' in each country group
  for (const country in orderedLeaguesByCountryName) {
    orderedLeaguesByCountryName[country].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }

  // Sorting the outer array by 'countryName'
  const finalOrderedResult = Object.entries(orderedLeaguesByCountryName)
    .sort(([countryA], [countryB]) => countryB.localeCompare(countryA))
    .map(([, competitions]) => competitions)

  return (
    <form action={createBolao}>
      <div className="mb-6">
        <Label htmlFor="name">Name:</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Choose a name for your bolão"
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="competitionId">Competition:</Label>
        <Select name="competitionId" required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a competition" />
          </SelectTrigger>
          <SelectContent>
            {finalOrderedResult.map((el: League[]) => (
              <SelectGroup>
                <SelectLabel>{el[0].countryName}</SelectLabel>
                {el.map((el: League) => (
                  <SelectItem value={el.id.toString()}>{el.name}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">Create</Button>
    </form>
  )
}

export default Form
