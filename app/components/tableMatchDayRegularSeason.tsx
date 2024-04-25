import { Match } from "../lib/definitions"

interface Props {
  matches: Match[]
}

function TableMatchDayRegularSeason({ matches }: Props) {
  if (matches) {
    return (
      <div>
        {matches.map((el: Match) => {
          const date = new Date(el.utcDate)
          const formattedDate = date.toUTCString()

          return (
            <div key={el.id} className="mb-4">
              <div className="text-xs text-center">{formattedDate}</div>

              <div className="flex text-center justify-center items-baseline">
                <span>{el.homeTeam.tla}</span>
                <span className="mx-4">
                  {el.score.regularTime?.home || `.`}
                </span>

                <span className="mx-4 text-xs">&times;</span>

                <span className="mx-4">
                  {el.score.regularTime?.away || `.`}
                </span>
                <span>{el.awayTeam.tla}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayRegularSeason
