"use client"

import { SignedIn } from "@clerk/nextjs"

import UserButtonWrapper from "./userButtonWrapper"

export default function HeaderUserActions() {
  return (
    <SignedIn>
      <UserButtonWrapper />
    </SignedIn>
  )
}
