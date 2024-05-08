import { ScoreGroup } from "@/app/lib/definitions"
import { INITIAL_BET_VALUE } from "@/app/lib/utils"

type Props = {
  score: ScoreGroup
  type: "away" | "home"
}

function TeamScore({ score, type }: Props) {
  let displayScore: string = INITIAL_BET_VALUE

  if (score.fulltime[type] !== null) {
    displayScore = score.fulltime[type].toString()
  } else if (score.halftime[type] !== null) {
    displayScore = score.halftime[type].toString()
  }

  return <div className="mx-4 content-center text-sm">{displayScore}</div>
}

export default TeamScore
