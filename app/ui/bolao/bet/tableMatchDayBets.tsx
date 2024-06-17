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
        {fixtures.map((fixtureData: FixtureData) => {
          const statusShort = fixtureData.fixture.status.short

          const disabled = !STATUSES_OPEN_TO_PLAY.includes(statusShort)

          const fixtureId = fixtureData.fixture.id.toString()
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
                date={fixtureData.fixture.date.toString()}
                status={fixtureData.fixture.status}
              />

              <div className="flex justify-center content-center">
                <ButtonsBet
                  fixtureId={fixtureId}
                  type="home"
                  userBolaoId={userBolaoId}
                  betValue={homeBet?.value}
                  betId={homeBet?.id}
                  disabled={false}
                />

                <TeamCodeLogo
                  logoSrc={fixtureData.teams.home.logo}
                  name={fixtureData.teams.home.name}
                />
                <TeamScore
                  score={fixtureData.score}
                  goals={fixtureData.goals}
                  type="home"
                  status={statusShort}
                />

                <span className="mx-3 text-xs content-center">&times;</span>

                <TeamScore
                  score={fixtureData.score}
                  goals={fixtureData.goals}
                  type="away"
                  status={statusShort}
                />
                <TeamCodeLogo
                  logoSrc={fixtureData.teams.away.logo}
                  name={fixtureData.teams.away.name}
                />

                <ButtonsBet
                  fixtureId={fixtureId}
                  type="away"
                  userBolaoId={userBolaoId}
                  betValue={awayBet?.value}
                  betId={awayBet?.id}
                  disabled={false}
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
