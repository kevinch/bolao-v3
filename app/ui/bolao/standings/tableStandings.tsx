import React from "react"
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

const textColors = [
  "text-blue-500",
  "text-cyan-500",
  "text-green-500",
  "text-orange-500",
  "text-violet-500",
  "text-lime-500",
  "text-fushia-500",
  "text-indigo-500",
]

const bgColors = [
  "bg-blue-500",
  "bg-cyan-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-violet-500",
  "bg-lime-500",
  "bg-fushia-500",
  "bg-indigo-500",
]

function getUniqueDescriptions(standings: Standing[][]): string[] {
  const descriptions = new Set<string>()

  standings.flat().forEach(({ description }) => {
    if (description) {
      descriptions.add(description)
    }
  })

  return Array.from(descriptions)
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
  const standings = standingsLeague.standings
  const uniqueDescriptions = getUniqueDescriptions(standings)

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
                {standingGroup.map((el: Standing, j: number) => {
                  const rankinkDescriptionIndex = uniqueDescriptions.findIndex(
                    (d) => d === el.description
                  )

                  const rankinColor =
                    el.description?.toLowerCase() === "relegation"
                      ? "text-red-500"
                      : rankinkDescriptionIndex !== -1
                        ? textColors[rankinkDescriptionIndex]
                        : "text-slate-500"

                  return (
                    <tr
                      key={`tr_${i}_group_${j}`}
                      className={clsx("text-center", {
                        "bg-slate-50": el.rank % 2 !== 0,
                      })}
                    >
                      <td className={`py-4 px-2 ${rankinColor}`}>{el.rank}</td>
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
                      <td className="px-2">
                        {el.all.goals.for - el.all.goals.against}
                      </td>
                      <td className="font-bold">{el.points}</td>
                      <td className="w-full">
                        <span className="flex flex-row justify-center">
                          {el.form
                            ?.split("")
                            .reverse()
                            .map((f, k) =>
                              f.toLowerCase() === "w" ? (
                                <CheckCircledIcon
                                  key={`standing_table_${i}_group${j}_f_${k}_check`}
                                  color="green"
                                  style={{ margin: "0 1px" }}
                                />
                              ) : f.toLowerCase() === "l" ? (
                                <CrossCircledIcon
                                  key={`standing_table_${i}_group${j}_f_${k}_cross`}
                                  color="red"
                                  style={{ margin: "0 1px" }}
                                />
                              ) : (
                                <MinusCircledIcon
                                  key={`standing_table_${i}_group${j}_f_${k}_minus`}
                                  style={{ margin: "0 1px" }}
                                />
                              )
                            )}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        )}

        <div className="px-4 py-2 flex items-start flex-row flex-wrap">
          {uniqueDescriptions.map((description, index) => {
            const rankinkDescriptionIndex = uniqueDescriptions.findIndex(
              (d) => d === description
            )

            const descriptionColor =
              description?.toLowerCase() === "relegation"
                ? "bg-red-500"
                : rankinkDescriptionIndex !== -1
                  ? bgColors[rankinkDescriptionIndex]
                  : "bg-slate-500"

            return (
              <span
                className="text-xs text-slate-400 mr-4 whitespace-nowrap"
                key={`legend_${index}`}
              >
                <span
                  key={`legend_${index}_description`}
                  className={`rounded-xs h-2 w-2 mr-1 inline-block ${descriptionColor}`}
                ></span>
                {description}
              </span>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default TableStandings
