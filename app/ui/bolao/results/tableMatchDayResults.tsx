"use client"

import { Match, Bet, PlayersData } from "@/app/lib/definitions"
import { STYLES_BOX_SHADOW, findBetObj } from "@/app/lib/utils"
import TeamCodeLogo from "@/app/ui/bolao/teamCodeLogo"
import TeamScore from "@/app/ui/bolao/teamScore"
import FixtureDate from "@/app/ui/bolao/fixtureDate"

import { AgGridReact } from "ag-grid-react" // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css" // Mandatory CSS required
import "ag-grid-community/styles/ag-theme-quartz.css"

import clsx from "clsx"

type TableProps = {
  fixtures: Match[]
  bets: Bet[]
  players: PlayersData[]
}

function TableMatchDayResults({ fixtures, bets, players }: TableProps) {
  if (fixtures) {
    const colDefs: any = [{ field: "fixture" }]
    const rowData: any = []

    // Add fixtures in 1st column
    fixtures.forEach((el: Match) => {
      const homeTLA = el.teams.home.name
        .toUpperCase()
        .replace(" ", "")
        .slice(0, 3)
      const awayTLA = el.teams.away.name
        .toUpperCase()
        .replace(" ", "")
        .slice(0, 3)

      const rowDataEntry: { [key: string]: any } = {
        fixture: `${homeTLA} x ${awayTLA}`,
      }

      const getBet = ({
        type,
        userBolaoId,
      }: {
        type: "home" | "away"
        userBolaoId: string
      }) => {
        const obj = findBetObj({
          bets,
          fixtureId: el.fixture.id.toString(),
          type,
          userBolaoId,
        })

        if (obj) {
          return obj.value.toString()
        }
        return "."
      }

      players.forEach((player) => {
        rowDataEntry[player.id] = `${getBet({
          type: "home",
          userBolaoId: player.userBolaoId,
        })} - ${getBet({ type: "away", userBolaoId: player.userBolaoId })}`
      })

      rowData.push(rowDataEntry)
    })

    // Add players to columns
    players.forEach((el) => {
      const name = el.firstName
      const email = el.email.split("@")[0]

      colDefs.push({
        field: el.id,
        headerName: name || email,
        sortable: false,
        headerClass: "text-center",
        cellRenderer: (params: any) => (
          <span className="flex flex-col text-center">
            <span>{params.value}</span>
            <span className="text-xs">pts</span>
          </span>
        ),
      })
    })

    return (
      <div
        className={clsx("ag-theme-quartzz", STYLES_BOX_SHADOW)}
        style={{ height: "400px", width: "100%" }}
      >
        <AgGridReact rowData={rowData} columnDefs={colDefs} rowHeight={65} />
      </div>
    )
  }

  return <p>loading...</p>
}

export default TableMatchDayResults
