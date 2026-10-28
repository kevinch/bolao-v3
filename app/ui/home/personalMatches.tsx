import { getTranslations } from "next-intl/server"
import { getPersonalPreviews } from "@/app/lib/controllerHome"
import MatchPreview from "./matchPreview"
import ChampionshipLogo from "./championshipLogo"

export default async function PersonalMatches({ userId }: { userId: string }) {
  const t = await getTranslations("homeMatches")
  let data
  try {
    data = await getPersonalPreviews(userId)
  } catch {
    return (
      <section aria-labelledby="personal-matches-title" className="mb-8 rounded-xl border p-5">
        <h2 id="personal-matches-title" className="text-xl font-bold">{t("personalTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("unavailable")}</p>
      </section>
    )
  }

  return (
    <section aria-labelledby="personal-matches-title" className="mb-8">
      <h2 id="personal-matches-title" className="text-xl font-bold">{t("personalTitle")}</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">{t("personalDescription")}</p>
      {!data.hasBoloes ? (
        <p className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">{t("noBoloes")}</p>
      ) : data.previews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {data.previews.map(({ bolao, matches }, index) => (
            <article key={bolao.id} className={`min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm ${index > 1 ? "hidden md:block" : ""}`}>
              <div className="flex items-center gap-3 border-b bg-muted/30 p-4">
                <ChampionshipLogo competitionId={Number(bolao.competition_id)} season={bolao.year}
                  logoSrc={matches[0].fixture.league.logo} />
                <div className="min-w-0">
                  <h3 className="break-words font-semibold">{bolao.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{matches[0].fixture.league.name} · {bolao.year}</p>
                </div>
              </div>
              <MatchPreview matches={matches} bolaoId={bolao.id} />
            </article>
          ))}
        </div>
      ) : data.notices.length === 0 ? (
        <p className="rounded-xl border bg-muted/30 p-5 text-sm">{t("caughtUp")}</p>
      ) : null}
    </section>
  )
}
