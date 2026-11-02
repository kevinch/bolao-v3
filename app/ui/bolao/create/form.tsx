"use client"

import { useTranslations } from "next-intl"
import { createBolao } from "@/app/lib/actions"
import InviteButton from "@/app/components/inviteButton"
import PageTitle from "@/app/components/pageTitle"
import BolaoPageTitle from "@/app/ui/bolao/bolaoPageTitle"
import NextGames from "@/app/ui/bolao/nextGames"
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
import { Bolao, League } from "@/app/lib/definitions"
import type { PreviewMatch } from "@/app/lib/homeMatches"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useState } from "react"

type FormProps = {
  leagues: League[]
  competitionId?: string
}

function Form({ leagues, competitionId }: FormProps) {
  const t = useTranslations("createBolao")
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [createdBolao, setCreatedBolao] = useState<{
    bolao: Bolao
    matches: PreviewMatch[]
    leagueName?: string
    leagueLogo?: string
  } | null>(null)

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

    if (result.success && "id" in result) {
      setCreatedBolao({
        bolao: result.bolao,
        matches: result.matches,
        leagueName: result.leagueName,
        leagueLogo: result.leagueLogo,
      })
    } else {
      toast({
        description: t("errorMessage"),
        variant: "destructive",
      })
    }
  }

  if (createdBolao) {
    return (
      <div>
        <PageTitle center={true}>
          <h1>{t("createdTitle")}</h1>
        </PageTitle>
        <BolaoPageTitle
          bolao={createdBolao.bolao}
          leagueLogo={createdBolao.leagueLogo}
          leagueName={createdBolao.leagueName}
          className="mt-0 mb-8"
        />

        <p
          role="status"
          aria-live="polite"
          className="mx-auto mb-4 max-w-xl rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center font-medium text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
        >
          {t("successMessage")}
        </p>
        <p className="mx-auto mb-8 max-w-xl text-center text-muted-foreground">
          {t("createdNote")}
        </p>

        <NextGames
          title={t("nextGames")}
          matches={createdBolao.matches}
          bolaoId={createdBolao.bolao.id}
        />

        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-center">
          <InviteButton
            bolaoId={createdBolao.bolao.id}
            bolaoName={createdBolao.bolao.name}
            size="default"
            className="w-full sm:w-auto"
          />
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/bolao/${createdBolao.bolao.id}/bet`}>
              {t("startBetting")}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageTitle center={true}>
        <h1>{t("title")}</h1>
      </PageTitle>

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
          <Select
            name="competitionId"
            required
            defaultValue={competitionId}
            key={competitionId ?? "empty"}
          >
            <SelectTrigger id="competitionId" className="w-full">
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
          <Button disabled className="w-full sm:w-auto">
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            {t("loadingButton")}
          </Button>
        ) : (
          <Button type="submit" className="w-full sm:w-auto">
            {t("submitButton")}
          </Button>
        )}
      </form>
    </div>
  )
}

export default Form
