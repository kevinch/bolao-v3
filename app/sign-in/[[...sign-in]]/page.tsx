"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { SignIn } from "@clerk/nextjs"
import PageTitle from "@/app/components/pageTitle"
import { SESSION_STORAGE_INVITE_KEY } from "@/app/lib/utils"

export default function Page() {
  /**
   * This is used to handle the issue with the redirect url in prod
   * It does not work for some reason, so new users loose the invite.
   * We store the redirect url to use it on the home and complete the invite flow.
   */
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url")
  const endsWithInvite = redirectUrl?.endsWith("invite")

  useEffect(() => {
    if (redirectUrl && endsWithInvite) {
      sessionStorage.setItem(SESSION_STORAGE_INVITE_KEY, redirectUrl)
    }
  }, [redirectUrl])

  return (
    <main>
      <PageTitle>Login</PageTitle>

      <div className="flex justify-center">
        <SignIn />
      </div>
    </main>
  )
}
