export type Competition = {
  name: string
  id: string
  area: {
    id: number
    name: string
    code: string
    flag: string
  }
  code: string
  type: string
  emblem?: string
  plan: string
  currentSeason: {
    id: number
    startDate: string
    endDate: string
    currentMatchDay: number
    winner?: string
    stages: []
  }
  numberOfAvailableSeasons?: number
  lastUpdated?: string
}

export type User = {
  name: string
  id: string
  role: string
}
