"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

interface Props {
  currentRound?: string
  allRounds: string[]
}

function Pagination({ currentRound, allRounds }: Props) {
  // console.log("currentRound", currentRound)
  // console.log("allRounds", allRounds)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = searchParams.get("round") || currentRound

  // const createPageURL = (pageNumber: number | string) => {
  //   const params = new URLSearchParams(searchParams)
  //   params.set("round", pageNumber.toString())

  //   return `${pathname}?${params.toString()}`
  // }

  const createPageURL = (value: number) => {
    const currentRoundIndex = allRounds.findIndex((el) => el == currentRound)
    const newRound = allRounds[currentRoundIndex + value]

    console.log("newRound", newRound)

    const params = new URLSearchParams(searchParams)
    params.set("round", newRound.toString())

    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex justify-center mb-10">
      <Link
        href={createPageURL(-1)}
        className="border px-2 mx-2 rounded bg-slate-50"
      >
        &lsaquo;
      </Link>
      <span>Round: {currentRound}</span>
      <Link
        href={createPageURL(+1)}
        className="border px-2 mx-2 rounded bg-slate-50"
      >
        &rsaquo;
      </Link>
    </div>
  )
}

export default Pagination
