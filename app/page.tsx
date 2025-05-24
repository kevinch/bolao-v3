import { Suspense } from "react"
import BoloesList from "@/app/ui/home/boloesList"
import { currentUser } from "@clerk/nextjs/server"
import PageTitle from "./components/pageTitle"
import { BoloesListSkeleton } from "@/app/ui/skeletons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import InviteRedirector from "@/app/components/InviteRedirector"

async function Home() {
  const user = await currentUser()

  if (user) {
    return (
      <main>
        <InviteRedirector />
        <PageTitle>
          Hey
          <br />
          <span className="font-bold">
            {user.username
              ? `${user.username}.`
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
      <InviteRedirector />
      <PageTitle>Simple soccer bets.</PageTitle>

      <div className="flex items-center flex-col space-y-8 uppercase">
        <Button asChild>
          <Link href="/sign-in">Login</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/sign-up">Register</Link>
        </Button>
      </div>
    </main>
  )
}

export default Home
