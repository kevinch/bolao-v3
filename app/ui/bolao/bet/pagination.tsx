"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRightIcon, ChevronLeftIcon } from "@radix-ui/react-icons"

type Props = {
  currentRoundIndex: number
  currentRoundName: string
  isLastRound: boolean
  isFirstRound: boolean
}

function Pagination({
  currentRoundIndex,
  currentRoundName,
  isLastRound,
  isFirstRound,
}: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (value: number) => {
    const newRound = currentRoundIndex + value

    // const params = new URLSearchParams(searchParams)
    const params = new URLSearchParams(searchParams.toString())
    params.set("roundIndex", newRound.toString())

    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex justify-center mb-4 items-center">
      {!isFirstRound && (
        <Button asChild size="icon" variant="outline">
          <Link href={createPageURL(-1)}>
            <ChevronLeftIcon />
          </Link>
        </Button>
      )}

      <span className="text-xs mx-4 lowercase first-letter:uppercase">
        {currentRoundName}
      </span>

      {!isLastRound && (
        <Button asChild size="icon" variant="outline">
          <Link href={createPageURL(+1)}>
            <ChevronRightIcon />
          </Link>
        </Button>
      )}
    </div>
  )
}

export default Pagination
