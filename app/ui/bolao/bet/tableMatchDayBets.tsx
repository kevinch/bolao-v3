import { FixtureData, Bet } from "@/app/lib/definitions"
import ButtonsBet from "./buttonsBet"
import { findBetObj, STATUSES_OPEN_TO_PLAY } from "@/app/lib/utils"
import TeamCodeLogo from "@/app/ui/bolao/teamCodeLogo"
import TeamScore from "@/app/ui/bolao/teamScore"
import FixtureDate from "@/app/ui/bolao/fixtureDate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import clsx from "clsx"

type TableProps = {
  fixtures: FixtureData[]
  userBolaoId: string
  bets: Bet[]
}

function TableMatchDayBets({ fixtures, userBolaoId, bets }: TableProps) {
  if (fixtures) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bet on the next matches</CardTitle>
        </CardHeader>
        <CardContent>
          {fixtures.map((fixtureData: FixtureData, i: number) => {
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
              <div
                key={fixtureId}
                className={clsx("py-4", {
                  "bg-slate-50": i % 2 !== 0,
                })}
              >
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
                    logoSrc={fixtureData.teams.home.logo}
                    name={fixtureData.teams.home.name}
                  />

                  <div>
                    <FixtureDate
                      date={fixtureData.fixture.date.toString()}
                      status={fixtureData.fixture.status}
                    />
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <TeamScore
                        score={fixtureData.score}
                        goals={fixtureData.goals}
                        type="home"
                        status={statusShort}
                      />

                      <span className="mx-3 text-xs content-center">
                        &times;
                      </span>

                      <TeamScore
                        score={fixtureData.score}
                        goals={fixtureData.goals}
                        type="away"
                        status={statusShort}
                      />
                    </div>
                  </div>

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
                    disabled={disabled}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayBets
