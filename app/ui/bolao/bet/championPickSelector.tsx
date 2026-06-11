"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { ChampionTeam, ChampionPick } from "@/app/lib/definitions"
import { createOrUpdateChampionPick } from "@/app/lib/actions"
import { formatDateFixtures } from "@/app/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  bolaoId: string
  userBolaoId: string
  teams: ChampionTeam[]
  userChampionPick: ChampionPick | null
  isLocked: boolean
  lockDate: Date | null
  leagueWinnerTeamId: number | null
  locale: string
}

function ChampionPickSelector({
  bolaoId,
  userBolaoId,
  teams,
  userChampionPick,
  isLocked,
  lockDate,
  leagueWinnerTeamId,
  locale,
}: Props) {
  const t = useTranslations("championPick")
  const { toast } = useToast()
  const [savedPick, setSavedPick] = useState<ChampionTeam | null>(
    userChampionPick
      ? {
          id: userChampionPick.team_id,
          name: userChampionPick.team_name,
          logo: userChampionPick.team_logo,
        }
      : null
  )
  const [selectedTeamId, setSelectedTeamId] = useState(
    userChampionPick ? String(userChampionPick.team_id) : undefined
  )
  const [isSaving, setIsSaving] = useState(false)
  const [formattedLockDate, setFormattedLockDate] = useState("")

  // Format after mount so the date is rendered in the user's timezone,
  // avoiding an SSR/client hydration mismatch.
  useEffect(() => {
    if (lockDate) {
      setFormattedLockDate(
        formatDateFixtures(Math.floor(lockDate.getTime() / 1000), locale)
      )
    }
  }, [lockDate, locale])

  const handleChange = async (teamIdStr: string) => {
    const team = teams.find((entry) => entry.id === Number(teamIdStr))
    if (!team || isSaving) return

    setSelectedTeamId(teamIdStr)
    setIsSaving(true)

    try {
      const result = await createOrUpdateChampionPick({
        userBolaoId,
        bolaoId,
        teamId: team.id,
        teamName: team.name,
        teamLogo: team.logo,
      })

      if (result.success) {
        setSavedPick(team)
        toast({
          variant: "success",
          title: t("saveSuccessTitle"),
          description: t("saveSuccessDescription", { team: team.name }),
        })
      } else {
        setSelectedTeamId(savedPick ? String(savedPick.id) : undefined)
        toast({
          variant: "destructive",
          title: t("saveErrorTitle"),
          description: result.message,
        })
      }
    } catch {
      setSelectedTeamId(savedPick ? String(savedPick.id) : undefined)
      toast({
        variant: "destructive",
        title: t("saveErrorTitle"),
        description: t("saveErrorDescription"),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusLine = (): string => {
    if (leagueWinnerTeamId !== null) {
      const winnerTeam = teams.find((team) => team.id === leagueWinnerTeamId)
      const winnerName = winnerTeam?.name ?? String(leagueWinnerTeamId)

      if (savedPick?.id === leagueWinnerTeamId) {
        return t("statusWon", { team: winnerName })
      }

      return t("statusLost", { team: winnerName })
    }

    if (isLocked) {
      return t("statusLocked")
    }

    if (savedPick) {
      return t("statusUnlockedHasPick", {
        team: savedPick.name,
        date: formattedLockDate,
      })
    }

    return t("statusUnlockedNoPick")
  }

  if (teams.length === 0 || isLocked) return null

  return (
    <div className="mb-4 flex justify-center">
      <div className="w-full max-w-xs">
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          {t("label")}
        </div>
        <Select
          value={selectedTeamId}
          onValueChange={handleChange}
          disabled={isLocked || isSaving}
        >
          <SelectTrigger aria-label={t("selectTeam")}>
            <SelectValue placeholder={t("placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={String(team.id)}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-muted-foreground">{getStatusLine()}</p>
      </div>
    </div>
  )
}

export default ChampionPickSelector
