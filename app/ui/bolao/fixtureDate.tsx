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
  locale?: string
}

function FixtureDate({ date, status, locale = "en" }: Props) {
  const inPlay = STATUSES_IN_PLAY.includes(status.short)
  const hasError = STATUSES_ERROR.includes(status.short)

  const formatedDate = formatDateFixtures(date.toString(), locale)

  return (
    <div className="text-xs text-center">
      {hasError ? (
        <>
          <span
            className={clsx("", {
              "text-orange-500": hasError,
            })}
          >
            {status.long}
          </span>
        </>
      ) : inPlay ? (
        <span className="text-cyan-600">{status.long}</span>
      ) : (
        formatedDate
      )}
    </div>
  )
}

export default FixtureDate
