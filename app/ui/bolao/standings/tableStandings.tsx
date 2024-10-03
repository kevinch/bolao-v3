import Image from "next/image"
import { STYLES_BOX_SHADOW } from "@/app/lib/utils"
import {
  Standing,
  StandingsGroup,
  StandingsLeague,
} from "@/app/lib/definitions"
import clsx from "clsx"

type TableProps = {
  standingsLeague: StandingsLeague
}

const thClasses = "font-normal text-xs py-3"

function Thead() {
  return (
    <thead className="uppercase">
      <tr>
        <th>&nbsp;&nbsp;</th>
        <th className="font-normal text-xs py-3 text-left w-2/6">Club</th>
        <th className={thClasses}>p</th>
        <th className={thClasses}>w</th>
        <th className={thClasses}>d</th>
        <th className={thClasses}>l</th>
        <th className={thClasses}>gf</th>
        <th className={thClasses}>ga</th>
        <th className={thClasses}>gd</th>
        <th className={clsx("font-bold")}>pts</th>
      </tr>
    </thead>
  )
}

function TableStandings({ standingsLeague }: TableProps) {
  return (
    <>
      {standingsLeague.standings.map(
        (standingGroup: StandingsGroup, i: number) => (
          <table
            key={`standing_table_${i}`}
            className={clsx(`${STYLES_BOX_SHADOW} w-full text-xs`)}
          >
            <Thead />
            <tbody>
              {standingGroup.map((el: Standing, j: number) => (
                <tr
                  key={`standing_table_${i}_group${j}`}
                  className={clsx("text-center py-5", {
                    "bg-slate-50": el.rank % 2 !== 0,
                  })}
                >
                  <td className="py-3">{el.rank}</td>
                  <td className="text-left">
                    <div className="flex items-center">
                      <Image
                        src={el.team.logo}
                        width={100} // Placeholder width
                        height={100} // Placeholder height
                        className="inline mr-2 max-h-[20px] max-w-[20px] object-contain"
                        alt={`${el.team.name}'s logo`}
                      />
                      <span className="whitespace-normal break-word">
                        {el.team.name}
                      </span>
                    </div>
                  </td>
                  <td>{el.all.played}</td>
                  <td>{el.all.win}</td>
                  <td>{el.all.draw}</td>
                  <td>{el.all.lose}</td>
                  <td>{el.all.goals.for}</td>
                  <td>{el.all.goals.against}</td>
                  <td>{el.all.goals.for - el.all.goals.against}</td>
                  <td className="font-bold">{el.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </>
  )
}

export default TableStandings
