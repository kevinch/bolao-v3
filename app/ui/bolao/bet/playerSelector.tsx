"use client"

import { useTranslations } from "next-intl"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PlayersData } from "@/app/lib/definitions"
import { getEmailUsername } from "@/app/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  players: PlayersData[]
  selectedUserBolaoId: string
}

function PlayerSelector({ players, selectedUserBolaoId }: Props) {
  const t = useTranslations("betPage")
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (userBolaoId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("userBolaoId", userBolaoId)

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-4 flex justify-center">
      <div className="w-full max-w-xs">
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          {t("bettingAs")}
        </div>
        <Select value={selectedUserBolaoId} onValueChange={handleChange}>
          <SelectTrigger aria-label={t("selectPlayerToBetAs")}>
            <SelectValue placeholder={t("selectPlayer")} />
          </SelectTrigger>
          <SelectContent>
            {players.map((player) => (
              <SelectItem key={player.userBolaoId} value={player.userBolaoId}>
                {player.username || getEmailUsername(player.email)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default PlayerSelector
