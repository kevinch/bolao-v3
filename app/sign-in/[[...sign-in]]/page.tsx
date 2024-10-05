import { SignIn } from "@clerk/nextjs"
import PageTitle from "@/app/components/pageTitle"

export default function Page() {
  return (
    <main>
      <PageTitle>Login</PageTitle>

      <div className="flex justify-center">
        <SignIn />
      </div>
    </main>
  )
}
