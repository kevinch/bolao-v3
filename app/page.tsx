import BoloesList from "@/app/ui/home/boloesList"
import { currentUser } from "@clerk/nextjs/server"

import Link from "next/link"

async function Home() {
  const user = await currentUser()

  if (user) {
    return (
      <main>
        <h1>
          Hey
          <br />
          {user.firstName
            ? `${user.firstName}.`
            : user.emailAddresses[0].emailAddress}
        </h1>
        <BoloesList />
      </main>
    )
  }

  return (
    <main>
      <h1>Simple soccer bets.</h1>

      <div style={{ margin: "30px 0" }}>
        <Link href="/sign-in">Sign-in</Link>&nbsp;
        <Link href="/sign-up">Sign-up</Link>
      </div>
    </main>
  )
}

export default Home
