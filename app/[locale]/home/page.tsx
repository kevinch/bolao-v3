import { Suspense } from "react"
import { getTranslations, setRequestLocale } from "next-intl/server"

import InviteRedirector from "@/app/components/InviteRedirector"
import PageTitle from "@/app/components/pageTitle"
import { getCachedCurrentUser } from "@/app/lib/auth-session"
import BoloesList from "@/app/ui/home/boloesList"
import { BoloesListSkeleton } from "@/app/ui/skeletons"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomeDashboard({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [user, t] = await Promise.all([
    getCachedCurrentUser(),
    getTranslations("home"),
  ])

  if (!user) {
    return null
  }

  return (
    <main>
      <InviteRedirector />
      <PageTitle>
        {t("greeting")}
        <br />
        <span className="font-bold">
          {user.username
            ? `${user.username}.`
            : user.emailAddresses[0].emailAddress.split("@")[0]}
        </span>
      </PageTitle>

      <Suspense fallback={<BoloesListSkeleton />}>
        <BoloesList />
      </Suspense>
    </main>
  )
}
