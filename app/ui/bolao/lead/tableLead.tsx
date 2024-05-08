import { STYLES_BOX_SHADOW } from "@/app/lib/utils"
import clsx from "clsx"
import { LeadData } from "@/app/lib/definitions"

const paddingVertical = "py-3"

type TableProps = {
  data: LeadData[]
}

function TableLead({ data }: TableProps) {
  return (
    <table className={clsx(`${STYLES_BOX_SHADOW} w-full text-xs`)}>
      <thead className="uppercase">
        <tr>
          <th className={paddingVertical} />
          <th className={`${paddingVertical} text-left pl-2`}>player</th>
          <th className={`${paddingVertical} text-right`}>score</th>
          <th className={`${paddingVertical} text-right pr-3`}>needs</th>
        </tr>
      </thead>
      <tbody className="f7">
        {data.map((player: any, playerIndex: number) => {
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
                <span className="leadtable-playername ttc pl2">
                  {player.name}
                </span>
              </td>
              <td className={paddingVertical}>
                <div className="flex justify-end">{player.total}</div>
              </td>
              <td className={`${paddingVertical} pr3`}>
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
  )
}

export default TableLead
