import { Match, Bet } from "@/app/lib/definitions"
import TeamCode from "@/app/ui/bolao/bet/teamCode"
import ButtonsBet from "./buttonsBet"
import {
  formatDate,
  findBetObj,
  STATUSES_OPEN_TO_PLAY,
  STATUSES_IN_PLAY,
} from "@/app/lib/utils"
import Image from "next/image"

interface TableProps {
  matches: Match[]
  userBolaoId: string
  bets: Bet[]
}

function TableMatchDay({ matches, userBolaoId, bets }: TableProps) {
  if (matches) {
    return (
      <div>
        {matches.map((match: Match) => {
          const disabled = !STATUSES_OPEN_TO_PLAY.includes(
            match.fixture.status.short
          )
          const inPlay = STATUSES_IN_PLAY.includes(match.fixture.status.short)
          const formatedDate = formatDate(match.fixture.date.toString())

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
            <div key={match.fixture.id} className="mb-4">
              <div className="text-xs text-center">
                {inPlay ? (
                  <span className="text-cyan-600">
                    {match.fixture.status.long}
                  </span>
                ) : (
                  formatedDate
                )}
              </div>

              <div className="flex text-center justify-center items-baseline">
                <ButtonsBet
                  fixtureId={match.fixture.id.toString()}
                  type="home"
                  userBolaoId={userBolaoId}
                  betValue={homeBet?.value}
                  betId={homeBet?.id}
                  disabled={disabled}
                />

                <Image
                  width={20}
                  height={20}
                  src={match.teams.home.logo}
                  alt={`${match.teams.home.name}'s logo`}
                />
                {/* <TeamCode>{match.teams.home.name}</TeamCode> */}
                <span className="mx-4">
                  {match.score.fulltime.home >= 0
                    ? match.score.fulltime.home
                    : `.`}
                </span>

                <span className="mx-4 text-xs">&times;</span>

                <span className="mx-4">
                  {match.score.fulltime.away >= 0
                    ? match.score.fulltime.away
                    : `.`}
                </span>
                {/* <TeamCode>{match.teams.away.name}</TeamCode> */}
                <Image
                  width={20}
                  height={20}
                  src={match.teams.away.logo}
                  alt={`${match.teams.away.name}'s logo`}
                />

                <ButtonsBet
                  fixtureId={match.fixture.id.toString()}
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

export default TableMatchDay
