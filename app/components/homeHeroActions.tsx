"use client"

import Link from "next/link"
import { SignedIn, SignedOut } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

type HomeHeroActionsProps = {
  getStartedLabel: string
  loginLabel: string
  dashboardLabel: string
  createBolaoLabel: string
}

export default function HomeHeroActions({
  getStartedLabel,
  loginLabel,
  dashboardLabel,
  createBolaoLabel,
}: HomeHeroActionsProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <SignedOut>
        <Button asChild>
          <Link href="/sign-up">{getStartedLabel}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/sign-in">{loginLabel}</Link>
        </Button>
      </SignedOut>

      <SignedIn>
        <Button asChild>
          <Link href="/dashboard">{dashboardLabel}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/bolao/create">{createBolaoLabel}</Link>
        </Button>
      </SignedIn>
    </div>
  )
}
