import { SignUp } from "@clerk/nextjs"
import PageTitle from "@/app/components/pageTitle"
import { Suspense } from "react"
import CompetitionIntentCapture from "@/app/components/CompetitionIntentCapture"
import { useTranslations } from "next-intl"

export default function Page() {
  const t = useTranslations("auth")
  return (
    <main>
      <Suspense fallback={null}><CompetitionIntentCapture /></Suspense>
      <PageTitle><h1>{t("signUpTitle")}</h1></PageTitle>

      <div className="flex justify-center">
        <SignUp />
      </div>
    </main>
  )
}
