"use client"

import dynamic from "next/dynamic"
import { ChevronDownIcon } from "@radix-ui/react-icons"

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => ({ default: mod.UserButton })),
  {
    ssr: false,
    loading: () => <div className="w-8 h-8" />,
  }
)

export default function UserButtonWrapper({
  showName = false,
}: {
  showName?: boolean
}) {
  return (
    <div className="relative flex min-h-10 items-center">
      <UserButton
        showName={showName}
        appearance={{
          elements: {
            userButtonBox: showName ? "md:gap-2 md:pr-5" : undefined,
            userButtonOuterIdentifier: showName ? "hidden md:block" : undefined,
          },
        }}
      />
      {showName ? (
        <ChevronDownIcon
          className="pointer-events-none absolute right-0 hidden h-3.5 w-3.5 text-muted-foreground md:block"
          aria-hidden
        />
      ) : null}
    </div>
  )
}
