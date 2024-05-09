import {
  STATUSES_IN_PLAY,
  STATUSES_ERROR,
  formatDateFixtures,
} from "@/app/lib/utils"
import { FixtureStatus } from "@/app/lib/definitions"
import clsx from "clsx"

type Props = {
  date: string
  status: FixtureStatus
}

function FixtureDate({ date, status }: Props) {
  const inPlay = STATUSES_IN_PLAY.includes(status.short)

  const formatedDate = formatDateFixtures(date.toString())

  return (
    <div className="text-xs text-center mb-4">
      {inPlay ? (
        <span className="text-cyan-600">{status.long}</span>
      ) : (
        formatedDate
      )}
      {STATUSES_ERROR.includes(status.short) && (
        <>
          &nbsp;-&nbsp;
          <span
            className={clsx("", {
              "text-orange-500": STATUSES_ERROR.includes(status.short),
            })}
          >
            {status.long}
          </span>
        </>
      )}
    </div>
  )
}

export default FixtureDate
