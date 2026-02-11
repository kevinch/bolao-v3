"use client"

import { FixtureData, Bet, PlayersData } from "@/app/lib/definitions"
import {
  findBetObj,
  INITIAL_BET_VALUE,
  STATUSES_FINISHED,
  STATUSES_IN_PLAY,
  STATUSES_OPEN_TO_PLAY,
} from "@/app/lib/utils"
import { calcScore } from "@/app/lib/scoresCalcFactory"
import { StickyTable, Row, Cell } from "react-sticky-table"
import TeamCodeLogo from "@/app/ui/bolao/teamCodeLogo"
import TeamScore from "@/app/ui/bolao/teamScore"
import FixtureDate from "@/app/ui/bolao/fixtureDate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TableProps = {
  fixtures: FixtureData[]
  bets: Bet[]
  players: PlayersData[]
  userId: string //Could be in context
}

const cellStyles = { padding: 0, margin: 0, border: 0, textAlign: "center" }

function TableMatchDayResults({ fixtures, bets, players, userId }: TableProps) {
  if (fixtures) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {STATUSES_OPEN_TO_PLAY.includes(
              fixtures[fixtures.length - 1].fixture.status.short
            )
              ? "Next games"
              : "Previous games"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StickyTable borderWidth={0}>
            <Row>
              <Cell style={cellStyles}>&nbsp;</Cell>
              {players.map((player: PlayersData) => {
                return (
                  <Cell style={cellStyles} key={player.id}>
                    <span className="font-semibold text-sm px-2">
                      {player.email.split("@")[0]}
                    </span>
                  </Cell>
                )
              })}
            </Row>

            {fixtures.map((fixtureData: FixtureData, i: number) => {
              const statusShort = fixtureData.fixture.status.short
              const canShowScores =
                STATUSES_IN_PLAY.includes(statusShort) ||
                STATUSES_FINISHED.includes(statusShort)

              const getBet = ({
                type,
                userBolaoId,
              }: {
                type: "home" | "away"
                userBolaoId: string
              }) => {
                const obj = findBetObj({
                  bets,
                  fixtureId: fixtureData.fixture.id.toString(),
                  type,
                  userBolaoId,
                })

                if (obj) {
                  return obj.value.toString()
                }
                return INITIAL_BET_VALUE
              }

              return (
                <Row key={fixtureData.fixture.id}>
                  <Cell
                    style={{
                      padding: "8px 0",
                      margin: 0,
                      border: 0,
                      backgroundColor: i % 2 !== 0 ? "rgb(248 250 252)" : "", //bg-slate-50
                    }}
                  >
                    <div className="flex justify-center content-center">
                      <TeamCodeLogo
                        logoSrc={fixtureData.teams.home.logo}
                        name={fixtureData.teams.home.name}
                      />
                      <div>
                        <FixtureDate
                          date={fixtureData.fixture.date.toString()}
                          status={fixtureData.fixture.status}
                        />
                        <div className="flex flex-row">
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
                    </div>
                  </Cell>

                  {players.map((player) => {
                    const showScores = player.id === userId || canShowScores

                    const betHome = getBet({
                      type: "home",
                      userBolaoId: player.userBolaoId,
                    })
                    const betAway = getBet({
                      type: "away",
                      userBolaoId: player.userBolaoId,
                    })

                    let score = 0
                    if (canShowScores) {
                      const fulltime = fixtureData.score.fulltime
                      const halftime = fixtureData.score.halftime

                      score = calcScore({
                        resultHome: fulltime.home || halftime.home || 0,
                        resultAway: fulltime.away || halftime.away || 0,
                        betHome: Number(betHome),
                        betAway: Number(betAway),
                      })
                    }

                    return (
                      <Cell
                        style={{
                          padding: 0,
                          margin: 0,
                          border: 0,
                          backgroundColor:
                            i % 2 !== 0 ? "rgb(248 250 252)" : "",
                        }}
                        key={`${fixtureData.fixture.id}_${player.id}`}
                        className="text-center"
                      >
                        <div>
                          {showScores ? betHome : INITIAL_BET_VALUE}-
                          {showScores ? betAway : INITIAL_BET_VALUE}
                        </div>
                        {canShowScores && (
                          <div className="text-sm">{`${score} pts`}</div>
                        )}
                      </Cell>
                    )
                  })}
                </Row>
              )
            })}

            {/* <Row>
            <Cell>total:</Cell>
            {players.map(() => (
              <Cell>...pts</Cell>
            ))}
          </Row> */}
          </StickyTable>
        </CardContent>
      </Card>
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayResults
