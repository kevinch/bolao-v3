import { ScoreArgs } from "./definitions"

// #1: Perfect score, ex: result: 3-0, your bet: 3-0
const score1 = 200

// #2: Score of the winner, ex: result: 3-0, your bet: 3-1
const score2 = 150

// #3: Get the winner's score and the goal difference, ex: result 2-1, your bet: 1-0
const score3 = 100

// #4: Get the draw score, ex: result: 1-1, your bet: 0-0
const score4 = 150

// #5: Get the winner and the loser's score, ex: result 1-3, your bet 1-2
const score5 = 120

// #6: Just the winner, ex: result 1-0, your bet 3-2
const score6 = 80

// Helper
const isNil = (value: any) => value === null || value === undefined

/**
 * @param {number} resultHome result of the host team
 * @param {number} resultAway user's bet for the host team
 *
 * @return {boolean}
 *
 * @description
 * Tells if the visitor team lost the match
 */
const awayIsLooser = ({
  resultHome,
  resultAway,
}: {
  resultHome: number
  resultAway: number
}): boolean => resultHome > resultAway

/**
 * @param {number} resultHome result of the host team
 * @param {number} resultAway user's bet for the host team
 *
 * @return {boolean}
 *
 * @description
 * Tells if the host team lost the match
 */
const homeIsLooser = (resultHome: number, resultAway: number): boolean =>
  resultHome < resultAway

/**
 * @param {number} resultHome result of the host team
 * @param {number} resultAway user's bet for the host team
 * @param {number} betHome result of the visiting team
 * @param {number} betAway user's bet for the visiting team
 *
 * @return {boolean}
 *
 * @description
 * Tells if a player has the looser's score in a match
 */
const getLooserScore = ({
  resultHome,
  resultAway,
  betHome,
  betAway,
}: ScoreArgs) => {
  if (homeIsLooser(resultHome, resultAway)) {
    return resultHome === betHome
  } else if (awayIsLooser({ resultHome, resultAway })) {
    return resultAway === betAway
  }
}

/**
 * @param {number} resultHome result of the host team
 * @param {number} resultAway user's bet for the host team
 * @param {number} betHome result of the visiting team
 * @param {number} betAway user's bet for the visiting team
 *
 * @return {boolean}
 *
 * @description
 * Tells if a player has the not perfect draw in a match
 */
const hasDrawNotFull = ({
  resultHome,
  resultAway,
  betHome,
  betAway,
}: ScoreArgs) => {
  return (
    resultHome === resultAway &&
    betHome === betAway &&
    (resultHome !== betHome || resultAway !== betAway)
  )
}

/**
 * @param {number} num1 a team result
 * @param {number} num2 a team result
 *
 * @return {boolean}
 *
 * @description
 * Tells if a player has the difference of goals in a match
 */
const hasGoalDifference = (num1: number, num2: number): number =>
  num1 > num2 ? num1 - num2 : num2 - num1

/**
 * @param {number} resultHome result of the host team
 * @param {number} resultAway user's bet for the host team
 * @param {number} betHome result of the visiting team
 * @param {number} betAway user's bet for the visiting team
 *
 * @return {boolean}
 *
 * @description
 * Tells if a player has the winning team in a match
 */
const haveWiningTeam = ({
  resultHome,
  betHome,
  resultAway,
  betAway,
}: ScoreArgs) => {
  return (
    (resultHome > resultAway && betHome > betAway) ||
    (resultHome < resultAway && betHome < betAway)
  )
}

// Scores calculations

export const isScore1 = ({
  resultHome,
  betHome,
  resultAway,
  betAway,
}: ScoreArgs) => resultHome === betHome && resultAway === betAway

export const isScore2 = ({
  resultHome,
  betHome,
  resultAway,
  betAway,
}: ScoreArgs) =>
  (resultHome > resultAway && betHome > betAway && resultHome === betHome) ||
  (resultHome < resultAway && betHome < betAway && resultAway === betAway)

export const isScore3 = ({
  resultHome,
  betHome,
  resultAway,
  betAway,
}: ScoreArgs) =>
  haveWiningTeam({ resultHome, resultAway, betHome, betAway }) &&
  hasGoalDifference(resultHome, resultAway) ===
    hasGoalDifference(betHome, betAway)

export const isScore4 = ({
  resultHome,
  betHome,
  resultAway,
  betAway,
}: ScoreArgs) => hasDrawNotFull({ resultHome, resultAway, betHome, betAway })

export const isScore5 = ({
  resultHome,
  betHome,
  resultAway,
  betAway,
}: ScoreArgs) =>
  haveWiningTeam({ resultHome, resultAway, betHome, betAway }) &&
  getLooserScore({ resultHome, resultAway, betHome, betAway })

export const isScore6 = ({
  resultHome,
  betHome,
  resultAway,
  betAway,
}: ScoreArgs) => haveWiningTeam({ resultHome, resultAway, betHome, betAway })

/**
 * @param {number} resultHome result of the host team
 * @param {number} resultAway user's bet for the host team
 * @param {number} betHome result of the visiting team
 * @param {number} betAway user's bet for the visiting team
 *
 * @return {number} points earned for a game
 *
 * The Joker allows for x2 points ONLY on the perfect bet
 */
export const calcScore = (data: ScoreArgs): number => {
  const resultHome = data.resultHome
  const resultAway = data.resultAway
  const betHome = data.betHome
  const betAway = data.betAway
  // const multiplier = data.multiplier
  // const isJoker = data.isJoker

  if (
    isNil(betHome) ||
    isNil(betAway) ||
    isNil(resultHome) ||
    isNil(resultAway)
  ) {
    return 0
  }

  let value
  // const multiplierValue = multiplier || 1
  const scoreCalcData = { resultHome, betHome, resultAway, betAway }

  if (isScore1(scoreCalcData)) {
    // value = isJoker ? score1 * 2 : score1
    value = score1
  } else if (isScore2(scoreCalcData)) {
    value = score2
  } else if (isScore3(data)) {
    value = score3
  } else if (isScore4(data)) {
    value = score4
  } else if (isScore5(data)) {
    value = score5
  } else if (isScore6(data)) {
    value = score6
  } else {
    value = 0
  }

  return value // * multiplierValue
}
