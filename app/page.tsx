import { Suspense } from "react"
import BoloesList from "@/app/ui/home/boloesList"
import { currentUser } from "@clerk/nextjs/server"
import PageTitle from "./components/pageTitle"
import { BoloesListSkeleton } from "./ui/skeletons"

import Link from "next/link"

async function Home() {
  const user = await currentUser()

  if (user) {
    return (
      <main>
        <PageTitle>
          Hey
          <br />
          <span className="font-bold">
            {user.firstName
              ? `${user.firstName}.`
              : user.emailAddresses[0].emailAddress.split("@")[0]}
          </span>
        </PageTitle>

        <Suspense fallback={<BoloesListSkeleton />}>
          <BoloesList />
        </Suspense>
      </main>
    )
  }

  return (
    <main>
      <PageTitle>Simple soccer bets.</PageTitle>

      <div className="flex items-center flex-col space-y-8 uppercase">
        <Link className="underline hover:no-underline" href="/sign-in">
          Sign-in
        </Link>
        <Link className="underline hover:no-underline" href="/sign-up">
          Sign-up
        </Link>
      </div>
    </main>
  )
}

export default Home
