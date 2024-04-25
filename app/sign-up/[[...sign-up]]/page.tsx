import { SignUp } from "@clerk/nextjs"
import PageTitle from "@/app/components/pageTitle"

export default function Page() {
  return (
    <main>
      <PageTitle>Sign Up</PageTitle>

      <SignUp />
    </main>
  )
}
