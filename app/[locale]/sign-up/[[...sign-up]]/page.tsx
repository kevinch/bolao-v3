import { SignUp } from "@clerk/nextjs"
import PageTitle from "@/app/components/pageTitle"

export default function Page() {
  return (
    <main>
      <PageTitle><h1>Register</h1></PageTitle>

      <div className="flex justify-center">
        <SignUp />
      </div>
    </main>
  )
}
