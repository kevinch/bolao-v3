"use client"

import { useTranslations, useLocale } from "next-intl"
import { STATUSES_OPEN_TO_PLAY } from "@/app/lib/utils"
import { ResultsTableView } from "@/app/lib/resultsTableData"
import { StickyTable, Row, Cell } from "react-sticky-table"
import TeamCodeLogo from "@/app/ui/bolao/teamCodeLogo"
import TeamScore from "@/app/ui/bolao/teamScore"
import FixtureDate from "@/app/ui/bolao/fixtureDate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TableProps = {
  tableView: ResultsTableView | null
}

const cellStyles = {
  padding: 0,
  margin: 0,
  border: 0,
  textAlign: "center",
  backgroundColor: "transparent",
}

const headerCellStyles = {
  ...cellStyles,
  backgroundColor: "white",
}

const totalsCellStyles = {
  ...cellStyles,
  borderTop: "1px solid rgb(226 232 240)",
  padding: "12px 0",
  fontWeight: 600,
  backgroundColor: "white",
}

function TableMatchDayResults({ tableView }: TableProps) {
  const t = useTranslations("resultsPage")
  const locale = useLocale()

  if (!tableView) {
    return <p>{t("loading")}</p>
  }

  const { players, rows, totals } = tableView
  const lastFixtureStatus =
    rows[rows.length - 1]?.fixture.fixture.status.short ?? "NS"

  return (
    <div className="max-md:mx-[calc((100dvw-100%)/-2)] md:mx-0">
      <Card className="max-md:rounded-none max-md:border-x-0 max-md:shadow-none md:rounded-xl md:border-x md:shadow-sm">
        <CardHeader className="p-4 md:p-6">
          <CardTitle>
            {STATUSES_OPEN_TO_PLAY.includes(lastFixtureStatus)
              ? t("nextGames")
              : t("previousGames")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[min(70vh,800px)] w-full max-md:h-[55vh]">
            <StickyTable borderWidth={0} stickyFooterCount={1}>
              <Row>
                <Cell style={headerCellStyles}>&nbsp;</Cell>
                {players.map((player, index) => (
                  <Cell style={headerCellStyles} key={`player_${index}`}>
                    <span className="font-semibold text-sm px-2">
                      {player.displayName}
                    </span>
                  </Cell>
                ))}
              </Row>

              {rows.map((row, rowIndex) => {
                const fixtureData = row.fixture
                const statusShort = fixtureData.fixture.status.short

                return (
                  <Row key={fixtureData.fixture.id}>
                    <Cell
                      style={{
                        padding: "8px 0",
                        margin: 0,
                        border: 0,
                        backgroundColor:
                          rowIndex % 2 !== 0 ? "rgb(248 250 252)" : "",
                      }}
                    >
                      <div className="flex justify-center content-center">
                        <TeamCodeLogo
                          logoSrc={fixtureData.teams.home.logo}
                          name={fixtureData.teams.home.name}
                        />
                        <div>
                          <FixtureDate
                            timestamp={fixtureData.fixture.timestamp}
                            status={fixtureData.fixture.status}
                            locale={locale}
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

                    {row.cells.map((cell, cellIndex) => (
                      <Cell
                        style={{
                          padding: 0,
                          margin: 0,
                          border: 0,
                          backgroundColor:
                            rowIndex % 2 !== 0 ? "rgb(248 250 252)" : "",
                        }}
                        key={`${fixtureData.fixture.id}_${cellIndex}`}
                        className="text-center"
                      >
                        <div>
                          {cell.home}-{cell.away}
                        </div>
                        {cell.points !== null && (
                          <div className="text-sm px-2">{`${cell.points} pts`}</div>
                        )}
                      </Cell>
                    ))}
                  </Row>
                )
              })}

              <Row>
                <Cell style={totalsCellStyles}>
                  <div className="text-left pl-6">{t("total")}</div>
                </Cell>
                {totals.map((total, index) => (
                  <Cell
                    style={totalsCellStyles}
                    key={`total_${index}`}
                    className="text-center"
                  >
                    <div className="text-sm">{`${total} pts`}</div>
                  </Cell>
                ))}
              </Row>
            </StickyTable>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TableMatchDayResults
