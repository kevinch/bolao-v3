import Image from "next/image"
import {
  Standing,
  StandingsGroup,
  StandingsLeague,
} from "@/app/lib/definitions"
import clsx from "clsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircledIcon,
  CrossCircledIcon,
  MinusCircledIcon,
} from "@radix-ui/react-icons"

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
        <th className={thClasses}>mp</th>
        <th className={thClasses}>+/-</th>
        <th className={clsx("font-bold")}>pts</th>
        <th className={thClasses}>form</th>
      </tr>
    </thead>
  )
}

function TableStandings({ standingsLeague }: TableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Standings</CardTitle>
      </CardHeader>
      <CardContent>
        {standingsLeague.standings.map(
          (standingGroup: StandingsGroup, i: number) => (
            <table key={`standing_table_${i}`} className={"w-full text-xs"}>
              <Thead />
              <tbody>
                {standingGroup.map((el: Standing, j: number) => (
                  <tr
                    key={`standing_table_${i}_group${j}`}
                    className={clsx("text-center", {
                      "bg-slate-50": el.rank % 2 !== 0,
                    })}
                  >
                    <td className="py-4">{el.rank}</td>
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
                    <td>{el.all.goals.for - el.all.goals.against}</td>
                    <td className="font-bold">{el.points}</td>
                    <td>
                      <span
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        {el.form
                          .split("")
                          .map((f) =>
                            f.toLowerCase() === "w" ? (
                              <CheckCircledIcon
                                color="green"
                                style={{ margin: "0 1px" }}
                              />
                            ) : f.toLowerCase() === "l" ? (
                              <CrossCircledIcon
                                color="red"
                                style={{ margin: "0 1px" }}
                              />
                            ) : (
                              <MinusCircledIcon style={{ margin: "0 1px" }} />
                            )
                          )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </CardContent>
    </Card>
  )
}

export default TableStandings
