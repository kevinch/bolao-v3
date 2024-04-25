import { ReactNode } from "react"
import { Match } from "../lib/definitions"

interface TlaProps {
  children: ReactNode
}

interface ButtonProps {
  children: ReactNode
}

interface TableProps {
  matches: Match[]
}

function Button({ children }: ButtonProps) {
  return (
    <button className="border px-2 mx-2 rounded bg-slate-50">{children}</button>
  )
}

function ButtonsBet() {
  return (
    <div>
      <Button>-</Button>.<Button>+</Button>
    </div>
  )
}

function Tla({ children }: TlaProps) {
  return <span className="">{children}</span>
}

function TableMatchDayRegularSeason({ matches }: TableProps) {
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
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayRegularSeason
