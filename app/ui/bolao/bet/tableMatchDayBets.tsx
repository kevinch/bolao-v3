import { Match, Bet } from "@/app/lib/definitions"
import ButtonsBet from "./buttonsBet"
import {
  findBetObj,
  STATUSES_OPEN_TO_PLAY,
  STYLES_BOX_SHADOW,
} from "@/app/lib/utils"
import TeamCodeLogo from "@/app/ui/bolao/teamCodeLogo"
import TeamScore from "@/app/ui/bolao/teamScore"
import FixtureDate from "@/app/ui/bolao/fixtureDate"

type TableProps = {
  fixtures: Match[]
  userBolaoId: string
  bets: Bet[]
}

function TableMatchDayBets({ fixtures, userBolaoId, bets }: TableProps) {
  if (fixtures) {
    return (
      <div className={STYLES_BOX_SHADOW}>
        {fixtures.map((match: Match) => {
          const shortStatus = match.fixture.status.short

          const disabled = !STATUSES_OPEN_TO_PLAY.includes(shortStatus)

          const fixtureId = match.fixture.id.toString()
          const homeBet: Bet | null = findBetObj({
            bets,
            fixtureId,
            type: "home",
          })

          const awayBet: Bet | null = findBetObj({
            bets,
            fixtureId,
            type: "away",
          })

          return (
            <div key={fixtureId} className="mb-4">
              <FixtureDate
                date={match.fixture.date.toString()}
                status={match.fixture.status}
              />

              <div className="flex justify-center content-center">
                <ButtonsBet
                  fixtureId={fixtureId}
                  type="home"
                  userBolaoId={userBolaoId}
                  betValue={homeBet?.value}
                  betId={homeBet?.id}
                  disabled={disabled}
                />

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

                <ButtonsBet
                  fixtureId={fixtureId}
                  type="away"
                  userBolaoId={userBolaoId}
                  betValue={awayBet?.value}
                  betId={awayBet?.id}
                  disabled={disabled}
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

export default TableMatchDayBets
