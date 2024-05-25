import { ScoreGroup } from "@/app/lib/definitions"
import {
  INITIAL_BET_VALUE,
  STATUSES_FINISHED,
  STATUSES_IN_PLAY,
} from "@/app/lib/utils"

type Props = {
  score: ScoreGroup
  type: "away" | "home"
  status: string
  goals: {
    home: number | null
    away: number | null
  }
}

function TeamScore({ score, type, status, goals }: Props) {
  let displayScore: string = INITIAL_BET_VALUE

  if (STATUSES_FINISHED.includes(status)) {
    displayScore = score.fulltime[type]?.toString() || INITIAL_BET_VALUE
  } else if (STATUSES_IN_PLAY.includes(status) && goals[type] !== null) {
    displayScore = goals[type]?.toString() || INITIAL_BET_VALUE
  }

  return <div className="mx-3 content-center text-base">{displayScore}</div>
}

export default TeamScore
