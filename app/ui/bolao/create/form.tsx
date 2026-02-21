"use client"

import { useTranslations } from "next-intl"
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
import { useRouter } from "next/navigation"
import { useState } from "react"

type FormProps = {
  leagues: League[]
}

function Form({ leagues }: FormProps) {
  const t = useTranslations("createBolao")
  const { toast } = useToast()
  const router = useRouter()
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
        title: t("successTitle"),
        description: t("successMessage"),
        variant: "success",
      })
      router.push("/")
    } else {
      toast({
        description: t("errorMessage"),
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <Label htmlFor="name">{t("nameLabel")}</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          placeholder={t("namePlaceholder")}
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="competitionId">{t("competitionLabel")}</Label>
        <Select name="competitionId" required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("competitionPlaceholder")} />
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
          {t("loadingButton")}
        </Button>
      ) : (
        <Button type="submit">{t("submitButton")}</Button>
      )}
    </form>
  )
}

export default Form
