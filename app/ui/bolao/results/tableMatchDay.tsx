import { Match, Bet } from "@/app/lib/definitions"
import { STYLES_BOX_SHADOW } from "@/app/lib/utils"
import TeamCodeLogo from "@/app/ui/bolao/teamCodeLogo"
import TeamScore from "@/app/ui/bolao/teamScore"
import FixtureDate from "@/app/ui/bolao/fixtureDate"

type TableProps = {
  fixtures: Match[]
  bets: Bet[]
}

function TableMatchDayResults({ fixtures, bets }: TableProps) {
  if (fixtures) {
    return (
      <div className={STYLES_BOX_SHADOW}>
        {fixtures.map((match: Match) => {
          const fixtureId = match.fixture.id.toString()

          return (
            <div key={fixtureId} className="mb-4">
              <FixtureDate
                date={match.fixture.date.toString()}
                status={match.fixture.status}
              />

              <div className="flex justify-center content-center">
                <TeamCodeLogo
                  logoSrc={match.teams.home.logo}
                  name={match.teams.home.name}
                />

                <TeamScore score={match.score} type="home" />

                <span className="mx-4 text-xs content-center">&times;</span>

                <TeamScore score={match.score} type="away" />

                <TeamCodeLogo
                  logoSrc={match.teams.away.logo}
                  name={match.teams.away.name}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayResults
