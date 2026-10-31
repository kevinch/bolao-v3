"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { SignIn } from "@clerk/nextjs"
import PageTitle from "@/app/components/pageTitle"
import { SESSION_STORAGE_INVITE_KEY } from "@/app/lib/utils"
import CompetitionIntentCapture from "@/app/components/CompetitionIntentCapture"
import { useTranslations } from "next-intl"

export default function Page() {
  const t = useTranslations("auth")
  /**
   * This is used to handle the issue with the redirect url in prod
   * It does not work for some reason, so new users loose the invite.
   * We store the redirect url to use it on the home and complete the invite flow.
   */
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url")
  const isInviteRedirect = redirectUrl?.endsWith("invite") ?? false

  useEffect(() => {
    if (isInviteRedirect && redirectUrl) {
      sessionStorage.setItem(SESSION_STORAGE_INVITE_KEY, redirectUrl)
    }
  }, [isInviteRedirect, redirectUrl])

  return (
    <main>
      <CompetitionIntentCapture />
      <PageTitle><h1>{t("signInTitle")}</h1></PageTitle>

      {isInviteRedirect && (
        <p className="mx-auto mb-6 max-w-md rounded-lg border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
          {t("inviteSignInHint")}
        </p>
      )}

      <div className="flex justify-center">
        <SignIn />
      </div>
      <p className="mx-auto mt-6 max-w-md text-center text-xs text-muted-foreground">
        {t("legalNotice")}{" "}
        <Link className="underline hover:no-underline" href="/terms">
          {t("terms")}
        </Link>{" "}
        {t("and")} {" "}
        <Link className="underline hover:no-underline" href="/privacy">
          {t("privacy")}
        </Link>
        .
      </p>
    </main>
  )
}
