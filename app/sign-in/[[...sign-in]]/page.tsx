import { SignIn } from "@clerk/nextjs"
import PageTitle from "@/app/components/pageTitle"

export default function Page() {
  return (
    <main>
      <PageTitle>Sign In</PageTitle>

      <SignIn />
    </main>
  )
}
