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

function Thead({ title }: { title: string }) {
  return (
    <thead className="uppercase">
      <tr>
        <th>&nbsp;&nbsp;</th>
        <th className="font-normal text-xs py-3 text-left w-2/6">{title}</th>
        <th className={thClasses}>p</th>
        <th className={thClasses}>w</th>
        <th className={thClasses}>d</th>
        <th className={thClasses}>l</th>
        <th className={thClasses}>gf</th>
        <th className={thClasses}>ga</th>
        <th className={thClasses}>gd</th>
        <th className={clsx("font-bold text-sm")}>pts</th>
      </tr>
    </thead>
  )
}

function TableStandings({ standingsLeague }: TableProps) {
  return (
    <>
      {standingsLeague.standings.map((standingGroup: StandingsGroup) => (
        <table className={clsx(`${STYLES_BOX_SHADOW} w-full text-xs`)}>
          <Thead title={standingGroup[0].group} />
          <tbody>
            {standingGroup.map((el: Standing) => (
              <tr
                className={clsx("text-center py-5", {
                  "bg-slate-50": el.rank % 2 !== 0,
                })}
              >
                <td className="py-3">{el.rank}</td>
                <td className="text-left">
                  <Image
                    src={el.team.logo}
                    width={20}
                    height={20}
                    alt={`Logo of ${el.team.name}`}
                    className="inline mr-2"
                  />
                  {el.team.name}
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
      ))}
    </>
  )
}

export default TableStandings
