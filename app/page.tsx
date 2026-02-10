import { Suspense } from "react"
import BoloesList from "@/app/ui/home/boloesList"
import { currentUser } from "@clerk/nextjs/server"
import PageTitle from "./components/pageTitle"
import { BoloesListSkeleton } from "@/app/ui/skeletons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import InviteRedirector from "@/app/components/InviteRedirector"

const sectionSpaceing = "mb-18"

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
    <main className="max-w-4xl mx-auto px-4">
      <InviteRedirector />

      {/* Hero Section */}
      <div className={`text-center ${sectionSpaceing}`}>
        <PageTitle>Soccer betting pools with friends.</PageTitle>
        <p className="text-xl text-gray-600 dark:text-gray-300 mt-4 mb-8">
          Compete on predictions.
          <br />
          Track results in real-time.
          <br />
          Win bragging rights.
        </p>

        <div className="flex items-center justify-center gap-4 mb-4">
          <Button asChild>
            <Link href="/sign-up">GET STARTED</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/sign-in">LOGIN</Link>
          </Button>
        </div>

        <Link
          href="/about"
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
        >
          Learn more about Bolão.io
        </Link>
      </div>

      {/* What is a Bolão? */}
      <section className={`${sectionSpaceing} text-center`}>
        <h2 className="text-2xl font-bold mb-4">What is a bolão?</h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          In Brazil, a bolão is a betting pool between friends around soccer
          championships. It&apos;s very popular during the World Cup and major
          tournaments. This app makes it easy to create and manage your own -{" "}
          <strong>no money involved</strong>, just friendly competition!
        </p>
      </section>

      {/* How it Works */}
      <section className={`${sectionSpaceing}`}>
        <h2 className="text-2xl font-bold mb-6 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">1</div>
            <h3 className="font-semibold mb-2">Create or Join</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start a new bolão for any supported league or join one with an
              invite link.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">2</div>
            <h3 className="font-semibold mb-2">Make Predictions</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Predict match results before they start. Update anytime before
              kickoff.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">3</div>
            <h3 className="font-semibold mb-2">Track & Win</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Watch the leaderboard update as matches finish. See who reigns
              supreme!
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={`${sectionSpaceing}`}>
        <h2 className="text-2xl font-bold mb-6 text-center">Why Bolão.io?</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold mb-1">Multiple Leagues</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Major soccer leagues supported with automatic fixture updates
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold mb-1">Works Everywhere</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No app to download - works on any device with a browser
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold mb-1">Completely Free</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No subscriptions, no hidden costs, no money involved
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div>
              <h3 className="font-semibold mb-1">Real-Time Updates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scores and standings refresh automatically as games end
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create your first bolão in minutes.
        </p>
        <Button asChild size="lg">
          <Link href="/sign-up">GET STARTED FOR FREE</Link>
        </Button>
      </section>
    </main>
  )
}

export default Home
