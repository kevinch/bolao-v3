import { getTranslations } from "next-intl/server"
import PageTitle from "./components/pageTitle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import InviteRedirector from "@/app/components/InviteRedirector"
import HomeHeroActions from "@/app/components/homeHeroActions"

// ISR: revalidate cached page every 5 minutes
export const revalidate = 300

const sectionSpaceing = "mb-18"

async function Home() {
  const t = await getTranslations("home")
  const tCommon = await getTranslations("common")

  return (
    <main className="max-w-4xl mx-auto px-4">
      <InviteRedirector />

      {/* Hero Section */}
      <div className={`text-center ${sectionSpaceing}`}>
        <PageTitle>{t("hero")}</PageTitle>
        <p className="text-xl text-gray-600 dark:text-gray-300 mt-4 mb-8">
          {t("tagline1")}
          <br />
          {t("tagline2")}
          <br />
          {t("tagline3")}
        </p>

        <HomeHeroActions
          getStartedLabel={t("getStarted")}
          loginLabel={t("login")}
          dashboardLabel={t("dashboard")}
          createBolaoLabel={tCommon("createBolao")}
        />

        <Link
          href="/about"
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
        >
          {t("learnMore")}
        </Link>
      </div>

      {/* What is a Bolão? */}
      <section className={`${sectionSpaceing} text-center`}>
        <h2 className="text-2xl font-bold mb-4">{t("whatIsBolao")}</h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          {t("whatIsBolaoDesc")}
        </p>
      </section>

      {/* How it Works */}
      <section className={`${sectionSpaceing}`}>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("howItWorks")}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">1</div>
            <h3 className="font-semibold mb-2">{t("step1Title")}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("step1Desc")}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">2</div>
            <h3 className="font-semibold mb-2">{t("step2Title")}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("step2Desc")}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">3</div>
            <h3 className="font-semibold mb-2">{t("step3Title")}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("step3Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={`${sectionSpaceing}`}>
        <h2 className="text-2xl font-bold mb-6 text-center">{t("whyBolao")}</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold mb-1">{t("featureLeagues")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("featureLeaguesDesc")}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold mb-1">{t("featureEverywhere")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("featureEverywhereDesc")}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold mb-1">{t("featureFree")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("featureFreeDesc")}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold mb-1">{t("featureRealtime")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("featureRealtimeDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">{t("readyToStart")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t("createFirstBolao")}
        </p>
        <Button asChild size="lg">
          <Link href="/sign-up">{t("getStartedFree")}</Link>
        </Button>
      </section>
    </main>
  )
}

export default Home
