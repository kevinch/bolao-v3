import { Match } from "@/app/lib/definitions"
import Tla from "@/app/ui/bolao/bet/tla"
import ButtonsBet from "./buttonsBet"
import Pagination from "./pagination"

interface TableProps {
  matches: Match[]
  currentMatchday?: string // prop drililng here
}

function TableMatchDayRegularSeason({
  matches,
  currentMatchday = "",
}: TableProps) {
  if (matches) {
    return (
      <div>
        <Pagination currentMatchday={currentMatchday} />

        <div>
          {matches.map((el: Match) => {
            const date = new Date(el.utcDate)
            const formattedDate = date.toUTCString()

            return (
              <div key={el.id} className="mb-4">
                <div className="text-xs text-center">{formattedDate}</div>

                <div className="flex text-center justify-center items-baseline">
                  <ButtonsBet />

                  <Tla>{el.homeTeam.tla}</Tla>
                  <span className="mx-4">
                    {el.score.regularTime?.home || `.`}
                  </span>

                  <span className="mx-4 text-xs">&times;</span>

                  <span className="mx-4">
                    {el.score.regularTime?.away || `.`}
                  </span>
                  <Tla>{el.awayTeam.tla}</Tla>

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
