import { Match } from "@/app/lib/definitions"
import TeamCode from "@/app/ui/bolao/bet/teamCode"
import ButtonsBet from "./buttonsBet"
import Pagination from "./pagination"

interface TableProps {
  matches: Match[]
  currentRound?: string // prop drililng here
  allRounds: string[] // prop drililng here
}

function TableMatchDayRegularSeason({
  matches,
  currentRound = "",
  allRounds,
}: TableProps) {
  if (matches) {
    return (
      <div>
        <Pagination currentRound={currentRound} allRounds={allRounds} />

        <div>
          {matches.map((el: Match) => {
            const date = new Date(el.fixture.date)
            const formattedDate = date.toUTCString()

            return (
              <div key={el.fixture.id} className="mb-4">
                <div className="text-xs text-center">{formattedDate}</div>

                <div className="flex text-center justify-center items-baseline">
                  <ButtonsBet />

                  <TeamCode>{el.teams.home.name}</TeamCode>
                  <span className="mx-4">{el.score.fulltime.home || `.`}</span>

                  <span className="mx-4 text-xs">&times;</span>

                  <span className="mx-4">{el.score.fulltime.away || `.`}</span>
                  <TeamCode>{el.teams.away.name}</TeamCode>

                  <ButtonsBet />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayRegularSeason
