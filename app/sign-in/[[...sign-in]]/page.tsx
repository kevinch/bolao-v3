import { SignIn } from "@clerk/nextjs"

export default function Page() {
  return (
    <main>
      <h1>Sign In</h1>

      <SignIn />
    </main>
  )
}
