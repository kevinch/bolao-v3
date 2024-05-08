"use client"

import { FixtureData, Bet, PlayersData } from "@/app/lib/definitions"
import {
  STYLES_BOX_SHADOW,
  findBetObj,
  INITIAL_BET_VALUE,
  STATUSES_FINISHED,
  STATUSES_IN_PLAY,
} from "@/app/lib/utils"
import { calcScore } from "@/app/lib/scoresCalcFactory"

import { StickyTable, Row, Cell } from "react-sticky-table"

import TeamCodeLogo from "@/app/ui/bolao/teamCodeLogo"
import TeamScore from "@/app/ui/bolao/teamScore"
import FixtureDate from "@/app/ui/bolao/fixtureDate"

type TableProps = {
  fixtures: FixtureData[]
  bets: Bet[]
  players: PlayersData[]
  userId: string //Could be in context
}

function TableMatchDayResults({ fixtures, bets, players, userId }: TableProps) {
  if (fixtures) {
    return (
      <div
        className={STYLES_BOX_SHADOW}
        style={{ height: "auto", width: "100%" }}
      >
        <StickyTable borderWidth={0}>
          <Row>
            <Cell>&nbsp;</Cell>
            {players.map((player: PlayersData) => {
              return (
                <Cell>{player.firstName || player.email.split("@")[0]}</Cell>
              )
            })}
          </Row>

          {fixtures.map((fixtureData: FixtureData) => {
            const statusShort = fixtureData.fixture.status.short
            const canShowScores =
              STATUSES_FINISHED.includes(statusShort) ||
              STATUSES_IN_PLAY.includes(statusShort)

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
              <Row>
                <Cell>
                  <FixtureDate
                    date={fixtureData.fixture.date.toString()}
                    status={fixtureData.fixture.status}
                  />

                  <div className="flex justify-center content-center">
                    <TeamCodeLogo
                      logoSrc={fixtureData.teams.home.logo}
                      name={fixtureData.teams.home.name}
                    />
                    <TeamScore score={fixtureData.score} type="home" />

                    <span className="mx-4 text-xs content-center">&times;</span>

                    <TeamScore score={fixtureData.score} type="away" />
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
                      resultHome: fulltime.home || halftime.home,
                      resultAway: fulltime.away || halftime.away,
                      betHome: Number(betHome),
                      betAway: Number(betAway),
                    })
                  }

                  return (
                    <Cell>
                      <span>
                        {showScores ? betHome : INITIAL_BET_VALUE}-
                        {showScores ? betAway : INITIAL_BET_VALUE}
                      </span>
                      <div>{score} pts</div>
                    </Cell>
                  )
                })}
              </Row>
            )
          })}

          <Row>
            <Cell>total:</Cell>
            {players.map(() => (
              <Cell>...pts</Cell>
            ))}
          </Row>
        </StickyTable>
      </div>
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayResults
