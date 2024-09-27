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
import { ReloadIcon } from "@radix-ui/react-icons"
import { League } from "@/app/lib/definitions"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

type FormProps = {
  leagues: League[]
}

function Form({ leagues }: FormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

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
  // It should be countryA.localeCompare(countryB)
  // For some reason it has to be inverted here
  const finalOrderedResult = Object.entries(orderedLeaguesByCountryName)
    .sort(([countryA], [countryB]) => countryB.localeCompare(countryA))
    .map(([, competitions]) => competitions)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await createBolao(formData)

    setLoading(false)

    if (result.success) {
      toast({
        description: "The bolão was successfully created.",
      })
    } else {
      toast({
        description: "There was an issue with the creation.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
            {finalOrderedResult.map((el: League[], index: number) => (
              <SelectGroup key={`league_${index}`}>
                <SelectLabel>{el[0].countryName}</SelectLabel>
                {el.map((el: League) => (
                  <SelectItem key={el.id} value={el.id.toString()}>
                    {el.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Button disabled>
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button type="submit">Create</Button>
      )}
    </form>
  )
}

export default Form
