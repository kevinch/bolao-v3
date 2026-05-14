import { Suspense } from "react"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import InviteRedirector from "@/app/components/InviteRedirector"
import PageTitle from "@/app/components/pageTitle"
import BoloesList from "@/app/ui/home/boloesList"
import { BoloesListSkeleton } from "@/app/ui/skeletons"

export default async function Dashboard() {
  const user = await currentUser()
  const t = await getTranslations("home")

  if (!user) {
    redirect("/sign-in")
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
