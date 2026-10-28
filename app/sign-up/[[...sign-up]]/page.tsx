import { SignUp } from "@clerk/nextjs"
import PageTitle from "@/app/components/pageTitle"
import { Suspense } from "react"
import CompetitionIntentCapture from "@/app/components/CompetitionIntentCapture"

export default function Page() {
  return (
    <main>
      <Suspense fallback={null}><CompetitionIntentCapture /></Suspense>
      <PageTitle><h1>Register</h1></PageTitle>

      <div className="flex justify-center">
        <SignUp />
      </div>
    </main>
  )
}
