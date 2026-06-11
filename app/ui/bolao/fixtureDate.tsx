"use client"

import { useEffect, useState } from "react"
import {
  STATUSES_IN_PLAY,
  STATUSES_ERROR,
  formatDateFixtures,
} from "@/app/lib/utils"
import { FixtureStatus } from "@/app/lib/definitions"
import clsx from "clsx"

type Props = {
  timestamp: number
  status: FixtureStatus
  locale?: string
}

function FixtureDate({ timestamp, status, locale = "en" }: Props) {
  const inPlay = STATUSES_IN_PLAY.includes(status.short)
  const hasError = STATUSES_ERROR.includes(status.short)
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    setFormattedDate(formatDateFixtures(timestamp, locale))
  }, [timestamp, locale])

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
        <span suppressHydrationWarning>{formattedDate || "\u00a0"}</span>
      )}
    </div>
  )
}

export default FixtureDate
