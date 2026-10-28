import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { fetchBoloesByUserId } from "@/app/lib/data"
import { BoloesListSkeleton } from "@/app/ui/skeletons"
import Championships from "./championships"
import BoloesList from "./boloesList"
import PersonalMatches from "./personalMatches"
import MatchesSkeleton from "./matchesSkeleton"

export default async function SignedInHome({ userId }: { userId: string }) {
  let boloes
  try {
    boloes = await fetchBoloesByUserId(userId)
  } catch {
    const t = await getTranslations("homeMatches")
    return <p className="text-sm text-muted-foreground">{t("unavailable")}</p>
  }

  if (boloes.length === 0) {
    return <Championships onboarding />
  }

  return (
    <>
      <Suspense fallback={<MatchesSkeleton />}>
        <PersonalMatches userId={userId} />
      </Suspense>
      <Suspense fallback={<BoloesListSkeleton />}>
        <BoloesList boloes={boloes} userId={userId} />
      </Suspense>
    </>
  )
}
