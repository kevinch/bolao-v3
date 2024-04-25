"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

interface Props {
  currentMatchday?: string
}

function Pagination({ currentMatchday }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage =
    Number(searchParams.get("matchday")) || Number(currentMatchday)

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set("matchday", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex justify-center mb-10">
      <Link
        href={createPageURL(currentPage - 1)}
        className="border px-2 mx-2 rounded bg-slate-50"
      >
        &lsaquo;
      </Link>
      <span>Round: {currentMatchday}</span>
      <Link
        href={createPageURL(currentPage + 1)}
        className="border px-2 mx-2 rounded bg-slate-50"
      >
        &rsaquo;
      </Link>
    </div>
  )
}

export default Pagination
