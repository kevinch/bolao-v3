"use client"

import { FixtureData, Bet, PlayersData } from "@/app/lib/definitions"
import {
  STYLES_BOX_SHADOW,
  findBetObj,
  INITIAL_BET_VALUE,
} from "@/app/lib/utils"

import { StickyTable, Row, Cell } from "react-sticky-table"

import TeamCodeLogo from "@/app/ui/bolao/teamCodeLogo"
import TeamScore from "@/app/ui/bolao/teamScore"
import FixtureDate from "@/app/ui/bolao/fixtureDate"

import clsx from "clsx"

type TableProps = {
  fixtures: FixtureData[]
  bets: Bet[]
  players: PlayersData[]
}

function TableMatchDayResults({ fixtures, bets, players }: TableProps) {
  if (fixtures) {
    return (
      <div
        className={clsx("ag-theme-quartzz", STYLES_BOX_SHADOW)}
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
                  const betHome = getBet({
                    type: "home",
                    userBolaoId: player.userBolaoId,
                  })
                  const betAway = getBet({
                    type: "home",
                    userBolaoId: player.userBolaoId,
                  })

                  return (
                    <Cell>
                      <span>
                        {betHome}-{betAway}
                      </span>
                      <div>pts</div>
                    </Cell>
                  )
                })}
              </Row>
            )
          })}

          <Row>
            <Cell>total:</Cell>
            {players.map(() => (
              <Cell>pts</Cell>
            ))}
          </Row>
        </StickyTable>
      </div>
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayResults
