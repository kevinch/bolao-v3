import { FixtureData, Bet } from "@/app/lib/definitions"
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
  fixtures: FixtureData[]
  userBolaoId: string
  bets: Bet[]
}

function TableMatchDayBets({ fixtures, userBolaoId, bets }: TableProps) {
  if (fixtures) {
    return (
      <div className={STYLES_BOX_SHADOW}>
        {fixtures.map((fixture: FixtureData) => {
          const shortStatus = fixture.fixture.status.short

          const disabled = !STATUSES_OPEN_TO_PLAY.includes(shortStatus)

          const fixtureId = fixture.fixture.id.toString()
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
                date={fixture.fixture.date.toString()}
                status={fixture.fixture.status}
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
                  logoSrc={fixture.teams.home.logo}
                  name={fixture.teams.home.name}
                />
                <TeamScore score={fixture.score} type="home" />

                <span className="mx-4 text-xs content-center">&times;</span>

                <TeamScore score={fixture.score} type="away" />
                <TeamCodeLogo
                  logoSrc={fixture.teams.away.logo}
                  name={fixture.teams.away.name}
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
