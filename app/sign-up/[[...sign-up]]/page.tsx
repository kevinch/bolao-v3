import { SignUp } from "@clerk/nextjs"
import Nav from "../../components/nav"

export default function Page() {
  return (
    <main>
      <Nav />

      <h1>Sign Up</h1>

      <SignUp />
    </main>
  )
}
