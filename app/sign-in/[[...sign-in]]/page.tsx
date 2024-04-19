import { SignIn } from "@clerk/nextjs"
import Nav from "@/app/components/nav"

export default function Page() {
  return (
    <main>
      <Nav />

      <h1>Sign In</h1>

      <SignIn />
    </main>
  )
}
