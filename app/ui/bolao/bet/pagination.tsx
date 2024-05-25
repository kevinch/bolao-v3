"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

type Props = {
  currentRoundIndex: number
  isLastRound: boolean
  isFirstRound: boolean
}

function Pagination({ currentRoundIndex, isLastRound, isFirstRound }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (value: number) => {
    const newRound = currentRoundIndex + value

    const params = new URLSearchParams(searchParams)
    params.set("roundIndex", newRound.toString())

    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex justify-center mb-10 items-center">
      {!isFirstRound && (
        <a
          href={createPageURL(-1)}
          className="border px-2 mx-2 rounded bg-slate-50"
        >
          &lsaquo;
        </a>
      )}

      <span className="uppercase text-xs">Round: {currentRoundIndex}</span>

      {!isLastRound && (
        <a
          href={createPageURL(+1)}
          className="border px-2 mx-2 rounded bg-slate-50"
        >
          &rsaquo;
        </a>
      )}
    </div>
  )
}

export default Pagination
