import { getTranslations } from "next-intl/server"
import clsx from "clsx"
import { LeadData } from "@/app/lib/definitions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const paddingVertical = "py-3"

type TableProps = {
  data: LeadData[]
  isChampionPickLocked?: boolean
}

async function TableLead({ data, isChampionPickLocked = false }: TableProps) {
  const t = await getTranslations("leadPage")
  const tChampion = await getTranslations("championPick")

  return (
    <div className="max-md:mx-[calc((100dvw-100%)/-2)] md:mx-0">
      <Card className="max-md:rounded-none max-md:border-x-0 max-md:shadow-none md:rounded-xl md:border-x md:shadow-sm">
        <CardHeader className="p-4 md:p-6">
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead className="uppercase">
              <tr>
                <th className={paddingVertical} />
                <th className={`${paddingVertical} text-left pl-2`}>
                  {t("player")}
                </th>
                <th className={`${paddingVertical} text-left pl-2`}>
                  {tChampion("leadColumnHeader")}
                </th>
                <th className={`${paddingVertical} text-right`}>
                  {t("score")}
                </th>
                <th className={`${paddingVertical} text-right pr-3`}>
                  {t("needs")}
                </th>
              </tr>
            </thead>
            <tbody className="f7">
              {data.map((player: LeadData, playerIndex: number) => {
                const missingPoints = data[0].total - player.total

                return (
                  <tr
                    key={playerIndex}
                    className={clsx("py-5", {
                      "bg-slate-50": playerIndex % 2 !== 0,
                    })}
                  >
                    <td className={`${paddingVertical} text-right`}>
                      <span
                        className={`${
                          playerIndex === 0
                            ? "gray-light"
                            : playerIndex === 1
                              ? "gray-medium"
                              : "gray-dark"
                        } f8`}
                      >
                        {(playerIndex + 1).toString().padStart(2, "0")}
                      </span>
                    </td>
                    <td className={paddingVertical}>
                      <span className="leadtable-playername ttc pl-2">
                        {player.name}
                      </span>
                    </td>
                    <td className={`${paddingVertical} pl-2`}>
                      {isChampionPickLocked && player.championPick?.name
                        ? player.championPick.name
                        : tChampion("noPick")}
                    </td>
                    <td className={paddingVertical}>
                      <div className="flex justify-end">{player.total}</div>
                    </td>
                    <td className={`${paddingVertical} pr-3`}>
                      <div className="flex justify-end">
                        {missingPoints === 0 ? (
                          <span className="gray-light f8">-</span>
                        ) : (
                          missingPoints
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

export default TableLead
