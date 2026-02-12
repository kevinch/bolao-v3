"use client"

import dynamic from "next/dynamic"

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => ({ default: mod.UserButton })),
  {
    ssr: false,
    loading: () => <div className="w-8 h-8" />,
  }
)

export default function UserButtonWrapper() {
  return <UserButton />
}
