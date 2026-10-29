import { getTranslations } from "next-intl/server"
import { getChampionshipPreviews } from "@/app/lib/controllerHome"
import MatchPreview from "./matchPreview"
import ChampionshipCreateLink from "./championshipCreateLink"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import ChampionshipLogo from "./championshipLogo"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Championships({ onboarding = false }: { onboarding?: boolean } = {}) {
  const t = await getTranslations("homeMatches")
  const { championships, hasErrors } = await getChampionshipPreviews()
  if (!onboarding && (championships.length === 0 || (hasErrors && championships.length < 3))) {
    return null
  }

  return (
    <section aria-labelledby="championships-title" className={onboarding ? "mb-8" : "mb-18"}>
      <div className={`mb-6 ${onboarding ? "" : "text-center"}`}>
        <h2 id="championships-title" className={`${onboarding ? "text-xl" : "text-2xl"} font-bold`}>{t(onboarding ? "onboardingTitle" : "visitorTitle")}</h2>
        <p className={`${onboarding ? "" : "mx-auto max-w-xl"} mt-2 text-sm text-muted-foreground`}>{t(onboarding ? "onboardingDescription" : "visitorDescription")}</p>
      </div>
      {championships.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {championships.map((championship, index) => (
            <article key={championship.id} className={`min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm ${index > 1 ? "hidden md:flex" : "flex"}`}>
              <div className="flex min-h-24 items-center gap-3 border-b bg-muted/30 p-4">
                <ChampionshipLogo competitionId={championship.id} season={championship.season}
                  logoSrc={championship.matches[0]?.fixture.league.logo} />
                <div className="min-w-0">
                  <h3 className="break-words font-semibold leading-snug">{championship.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{championship.country} · {championship.season}</p>
                  {championship.status && (
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${championship.status === "upcoming"
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-muted text-muted-foreground"}`}>
                      {t(championship.status === "upcoming" ? "startingSoon" : "inProgress")}
                    </span>
                  )}
                </div>
              </div>
              <MatchPreview matches={championship.matches} />
              <div className="mt-auto border-t p-4">
                <ChampionshipCreateLink competitionId={championship.id} name={championship.name} signedIn={onboarding}>
                  {t("create")}<ArrowRightIcon aria-hidden="true" />
                </ChampionshipCreateLink>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">{t(hasErrors ? "unavailable" : "awaitingData")}</p>
          {onboarding && (
            <Button asChild className="mt-4">
              <Link href="/bolao/create">{t("create")}</Link>
            </Button>
          )}
        </div>
      )}
      {onboarding && <p className="mt-5 text-sm text-muted-foreground">{t("onboardingInvite")}</p>}
    </section>
  )
}
