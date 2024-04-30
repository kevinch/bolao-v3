import { Match } from "@/app/lib/definitions"
import TeamCode from "@/app/ui/bolao/bet/teamCode"
import ButtonsBet from "./buttonsBet"
import { formatDate } from "@/app/lib/utils"

interface TableProps {
  matches: Match[]
}

function TableMatchDayRegularSeason({ matches }: TableProps) {
  if (matches) {
    return (
      <div>
        {matches.map((el: Match) => (
          <div key={el.fixture.id} className="mb-4">
            <div className="text-xs text-center">
              {formatDate(el.fixture.date.toString())}
            </div>

            <div className="flex text-center justify-center items-baseline">
              <ButtonsBet />

              <TeamCode>{el.teams.home.name}</TeamCode>
              <span className="mx-4">
                {el.score.fulltime.home >= 0 ? el.score.fulltime.home : `.`}
              </span>

              <span className="mx-4 text-xs">&times;</span>

              <span className="mx-4">
                {el.score.fulltime.away >= 0 ? el.score.fulltime.away : `.`}
              </span>
              <TeamCode>{el.teams.away.name}</TeamCode>

              <ButtonsBet />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayRegularSeason
