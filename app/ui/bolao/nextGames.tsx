import { useId } from "react"
import MatchPreview from "@/app/ui/home/matchPreview"
import type { PreviewMatch } from "@/app/lib/homeMatches"

type Props = {
  title: string
  matches: PreviewMatch[]
  bolaoId: string
}

function NextGames({ title, matches, bolaoId }: Props) {
  const titleId = useId()

  if (!matches.length) return null

  return (
    <section aria-labelledby={titleId} className="mb-8">
      <h2 id={titleId} className="mb-4 text-xl font-bold">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {matches.map((match, index) => (
          <article
            key={match.fixture.fixture.id}
            className={`min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm ${
              index > 1 ? "hidden md:block" : ""
            }`}
          >
            <MatchPreview matches={[match]} bolaoId={bolaoId} />
          </article>
        ))}
      </div>
    </section>
  )
}

export default NextGames
