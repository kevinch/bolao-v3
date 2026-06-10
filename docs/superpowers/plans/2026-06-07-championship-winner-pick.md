# Championship Winner Pick Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let each bolão member optionally pick a championship winner (+500 pts if correct), editable until the earliest season fixture kickoff, revealed on the Lead page after lock.

**Architecture:** Dedicated `champion_picks` table with upsert server action. Lock/team-list helpers derived from all-season fixtures. Bet page uses a `PlayerSelector`-style Shadcn Select (stacked below admin selector). Lead page adds a "Winner pick" column after lock. Scoring extended in `calcLead` using League API season winner.

**Tech Stack:** Next.js App Router, Vercel Postgres (`@vercel/postgres`), Clerk auth, api-football via existing `fetchFixtures`/`fetchLeague`, Vitest, next-intl, Shadcn Select.

**Spec:** [`docs/superpowers/specs/2026-06-07-championship-winner-pick-design.md`](../specs/2026-06-07-championship-winner-pick-design.md)

**Branch:** `feature/championship-winner-pick`

---

## File map

| File | Responsibility |
|------|----------------|
| `scripts/seed.js` | `champion_picks` table DDL |
| `app/lib/definitions.ts` | `ChampionPick`, `ChampionTeam`, result types; extend `LeadData` |
| `app/lib/utils.ts` | `CHAMPION_PICK_BONUS_POINTS`, lock/team helpers |
| `app/lib/championPick.ts` | `getLeagueWinnerTeamId` (League API winner extraction) |
| `app/lib/data.ts` | `fetchChampionPick`, `fetchChampionPicks` |
| `app/lib/actions.ts` | `createOrUpdateChampionPick` |
| `app/lib/calcLeadFactory.ts` | Champion bonus in totals |
| `app/lib/controllerBet.ts` | All-season fixtures + champion pick state for Bet page |
| `app/lib/controllerLead.ts` | Champion picks + lock + winner for Lead page |
| `app/ui/bolao/bet/championPickSelector.tsx` | Client Select component (mirrors `playerSelector.tsx`) |
| `app/bolao/[id]/bet/page.tsx` | Render selector |
| `app/ui/bolao/lead/tableLead.tsx` | Winner pick column |
| `app/bolao/[id]/lead/page.tsx` | Pass champion data to table + calcLead |
| `messages/en.json`, `messages/pt-br.json` | i18n strings |
| `app/lib/__tests__/championPick.test.ts` | Utils + winner extraction tests |
| `app/lib/__tests__/actions.test.ts` | Server action tests |
| `app/lib/__tests__/calcLeadFactory.test.ts` | Bonus scoring tests |
| `app/ui/bolao/bet/__tests__/championPickSelector.test.tsx` | Component tests |
| `app/ui/bolao/lead/__tests__/tableLead.test.tsx` | Lead column tests |

---

### Task 1: Types and constants

**Files:**
- Modify: `app/lib/definitions.ts`
- Modify: `app/lib/utils.ts`

- [ ] **Step 1: Add types to `definitions.ts`**

Add after the `Bet` type:

```typescript
export type ChampionTeam = {
  id: number
  name: string
  logo: string
}

export type ChampionPick = {
  id: string
  user_bolao_id: string
  team_id: number
  team_name: string
  team_logo: string
  created_at: string
  updated_at: string
}

type SuccessChampionPickResult = ChampionPick & { success: true }

export type ChampionPickResult = SuccessChampionPickResult | ErrorResult

export type LeadData = {
  name: string
  total: number
  championPick?: ChampionTeam | null
}
```

Remove the old inline `LeadData` type if it exists separately (merge into this shape).

- [ ] **Step 2: Add constant to `utils.ts`**

```typescript
export const CHAMPION_PICK_BONUS_POINTS = 500
```

- [ ] **Step 3: Run typecheck**

Run: `yarn build` (or `npx tsc --noEmit` if available)
Expected: no new type errors from `LeadData` shape change — fix any call sites that break.

- [ ] **Step 4: Commit** *(requires user approval per AGENTS.md)*

```bash
git add app/lib/definitions.ts app/lib/utils.ts
git commit -m "feat: add champion pick types and bonus constant"
```

---

### Task 2: Champion pick utilities (TDD)

**Files:**
- Create: `app/lib/__tests__/championPick.test.ts`
- Modify: `app/lib/utils.ts`
- Create: `app/lib/championPick.ts`

- [ ] **Step 1: Write failing tests for lock + teams helpers**

Create `app/lib/__tests__/championPick.test.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from "vitest"
import {
  isChampionPickLocked,
  getChampionPickLockDate,
  getTeamsFromFixtures,
} from "../utils"
import { getLeagueWinnerTeamId } from "../championPick"
import type { FixtureData } from "../definitions"

function makeFixture(
  id: number,
  date: string,
  home: { id: number; name: string },
  away: { id: number; name: string }
): FixtureData {
  return {
    fixture: { id, date: new Date(date) } as FixtureData["fixture"],
    teams: {
      home: { ...home, logo: `${home.name}.png`, winner: null },
      away: { ...away, logo: `${away.name}.png`, winner: null },
    },
  } as FixtureData
}

describe("champion pick utils", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe("getChampionPickLockDate", () => {
    it("returns earliest fixture date", () => {
      const fixtures = [
        makeFixture(2, "2026-06-15T19:00:00Z", { id: 1, name: "B" }, { id: 2, name: "C" }),
        makeFixture(1, "2026-06-11T19:00:00Z", { id: 3, name: "A" }, { id: 4, name: "D" }),
      ]
      expect(getChampionPickLockDate(fixtures)).toEqual(new Date("2026-06-11T19:00:00Z"))
    })

    it("returns null for empty fixtures", () => {
      expect(getChampionPickLockDate([])).toBeNull()
    })
  })

  describe("isChampionPickLocked", () => {
    it("returns false before earliest kickoff", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-06-10T12:00:00Z"))
      const fixtures = [
        makeFixture(1, "2026-06-11T19:00:00Z", { id: 1, name: "A" }, { id: 2, name: "B" }),
      ]
      expect(isChampionPickLocked(fixtures)).toBe(false)
    })

    it("returns true at or after earliest kickoff", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-06-11T19:00:00Z"))
      const fixtures = [
        makeFixture(1, "2026-06-11T19:00:00Z", { id: 1, name: "A" }, { id: 2, name: "B" }),
      ]
      expect(isChampionPickLocked(fixtures)).toBe(true)
    })
  })

  describe("getTeamsFromFixtures", () => {
    it("dedupes and sorts teams alphabetically", () => {
      const fixtures = [
        makeFixture(1, "2026-06-11T19:00:00Z", { id: 10, name: "Mexico" }, { id: 20, name: "Brazil" }),
        makeFixture(2, "2026-06-12T19:00:00Z", { id: 10, name: "Mexico" }, { id: 30, name: "Argentina" }),
      ]
      expect(getTeamsFromFixtures(fixtures)).toEqual([
        { id: 30, name: "Argentina", logo: "Argentina.png" },
        { id: 20, name: "Brazil", logo: "Brazil.png" },
        { id: 10, name: "Mexico", logo: "Mexico.png" },
      ])
    })
  })

  describe("getLeagueWinnerTeamId", () => {
    it("returns winner id from current season", () => {
      const league = {
        seasons: [
          { year: 2026, current: true, winner: { id: 10, name: "Brazil" } },
        ],
      }
      expect(getLeagueWinnerTeamId(league)).toBe(10)
    })

    it("returns null when no winner yet", () => {
      const league = {
        seasons: [
          { year: 2026, current: true, winner: null },
        ],
      }
      expect(getLeagueWinnerTeamId(league)).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test app/lib/__tests__/championPick.test.ts`
Expected: FAIL — exports not found

- [ ] **Step 3: Implement helpers in `utils.ts`**

```typescript
import { ChampionTeam, FixtureData } from "./definitions"

export function getChampionPickLockDate(fixtures: FixtureData[]): Date | null {
  if (fixtures.length === 0) return null
  const sorted = sortFixtures([...fixtures])
  return new Date(sorted[0].fixture.date)
}

export function isChampionPickLocked(fixtures: FixtureData[]): boolean {
  const lockDate = getChampionPickLockDate(fixtures)
  if (!lockDate) return false
  return Date.now() >= lockDate.getTime()
}

export function getTeamsFromFixtures(fixtures: FixtureData[]): ChampionTeam[] {
  const byId = new Map<number, ChampionTeam>()
  for (const fixture of fixtures) {
    for (const team of [fixture.teams.home, fixture.teams.away]) {
      if (!byId.has(team.id)) {
        byId.set(team.id, { id: team.id, name: team.name, logo: team.logo })
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}
```

- [ ] **Step 4: Implement `app/lib/championPick.ts`**

```typescript
import { getCurrentSeasonObject } from "./utils"

type LeagueSeason = {
  year: number
  current: boolean
  winner?: { id: number; name: string } | null
}

type LeagueResponse = {
  seasons: LeagueSeason[]
}

export function getLeagueWinnerTeamId(league: LeagueResponse): number | null {
  const currentSeason = getCurrentSeasonObject(league.seasons as any)
  return currentSeason?.winner?.id ?? null
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `yarn test app/lib/__tests__/championPick.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/lib/utils.ts app/lib/championPick.ts app/lib/__tests__/championPick.test.ts
git commit -m "feat: add champion pick lock and team list helpers"
```

---

### Task 3: Database table

**Files:**
- Modify: `scripts/seed.js`

- [ ] **Step 1: Add `seedChampionPicks` function**

```javascript
async function seedChampionPicks(client) {
  try {
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS champion_picks (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_bolao_id VARCHAR(100) NOT NULL UNIQUE,
        team_id INTEGER NOT NULL,
        team_name VARCHAR(200) NOT NULL,
        team_logo VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `
    console.log(`Created "champion_picks" table`)
    return { createTable }
  } catch (error) {
    console.error("Error creating table champion_picks:", error)
    throw error
  }
}
```

Call `await seedChampionPicks(client)` in `main()` after `seedBets`.

- [ ] **Step 2: Run seed against dev DB** *(if POSTGRES env available)*

Run: `node scripts/seed.js`
Expected: `Created "champion_picks" table`

- [ ] **Step 3: Commit**

```bash
git add scripts/seed.js
git commit -m "feat: add champion_picks table to seed script"
```

---

### Task 4: Data fetchers

**Files:**
- Modify: `app/lib/data.ts`
- Modify: `app/lib/__tests__/data.test.ts` *(create if missing, or add to existing)*

- [ ] **Step 1: Write failing tests**

Add to a new or existing data test file:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@vercel/postgres", () => ({ sql: vi.fn() }))

import { sql } from "@vercel/postgres"
import { fetchChampionPick, fetchChampionPicks } from "../data"

describe("champion pick data", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetchChampionPick returns row or null", async () => {
    vi.mocked(sql).mockResolvedValue({
      rows: [{ id: "cp-1", user_bolao_id: "ub-1", team_id: 10, team_name: "Brazil", team_logo: "b.png" }],
    } as any)
    const result = await fetchChampionPick("ub-1")
    expect(result?.team_id).toBe(10)
  })

  it("fetchChampionPicks returns empty for empty input", async () => {
    const result = await fetchChampionPicks([])
    expect(result).toEqual([])
  })
})
```

- [ ] **Step 2: Run test — verify FAIL**

Run: `yarn test app/lib/__tests__/data.test.ts` *(adjust path to wherever tests land)*

- [ ] **Step 3: Implement fetchers in `data.ts`**

```typescript
import { ChampionPick } from "./definitions"

export async function fetchChampionPick(userBolaoId: string): Promise<ChampionPick | null> {
  if (!userBolaoId) return null
  try {
    const data = await sql`
      SELECT * FROM champion_picks
      WHERE CAST(user_bolao_id AS VARCHAR) = ${userBolaoId}
    `
    return (data.rows[0] as ChampionPick) ?? null
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch champion pick.")
  }
}

export async function fetchChampionPicks(userBolaoIds: string[]): Promise<ChampionPick[]> {
  if (!userBolaoIds.length) return []
  try {
    const data = await sql`
      SELECT * FROM champion_picks
      WHERE CAST(user_bolao_id AS VARCHAR) = ANY(${userBolaoIds as any})
    `
    return data.rows as ChampionPick[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch champion picks.")
  }
}
```

- [ ] **Step 4: Run tests — verify PASS**

- [ ] **Step 5: Commit**

```bash
git add app/lib/data.ts app/lib/__tests__/data.test.ts
git commit -m "feat: add champion pick data fetchers"
```

---

### Task 5: Server action (TDD)

**Files:**
- Modify: `app/lib/actions.ts`
- Modify: `app/lib/__tests__/actions.test.ts`

- [ ] **Step 1: Write failing tests**

Add a new `describe("createOrUpdateChampionPick")` block. Mock:
- `@clerk/nextjs/server` → `auth` returns `{ userId: "user-1" }`
- `../data` → `fetchUserBolao`, `fetchFixtures`
- `../utils` → `isChampionPickLocked`

Test cases:
1. Rejects when not authenticated
2. Rejects when user doesn't own `userBolaoId`
3. Rejects when locked
4. Upserts successfully when unlocked

Example success test skeleton:

```typescript
it("upserts champion pick when unlocked", async () => {
  vi.mocked(auth).mockResolvedValue({ userId: "user-1" } as any)
  vi.mocked(fetchUserBolao).mockResolvedValue({ id: "ub-1", user_id: "user-1" } as any)
  vi.mocked(fetchFixtures).mockResolvedValue([/* fixture before lock */] as any)
  vi.mocked(isChampionPickLocked).mockReturnValue(false)
  vi.mocked(sql).mockResolvedValue({
    rows: [{ id: "cp-1", user_bolao_id: "ub-1", team_id: 10, team_name: "Brazil", team_logo: "b.png", success: true }],
  } as any)

  const result = await createOrUpdateChampionPick({
    userBolaoId: "ub-1",
    bolaoId: "bolao-1",
    teamId: 10,
    teamName: "Brazil",
    teamLogo: "b.png",
  })

  expect(result.success).toBe(true)
})
```

- [ ] **Step 2: Run tests — verify FAIL**

- [ ] **Step 3: Implement `createOrUpdateChampionPick` in `actions.ts`**

```typescript
import {
  fetchUserBolao,
  fetchBolao,
  fetchFixtures,
} from "./data"
import {
  isChampionPickLocked,
} from "./utils"
import { ChampionPickResult } from "./definitions"

export async function createOrUpdateChampionPick({
  userBolaoId,
  bolaoId,
  teamId,
  teamName,
  teamLogo,
}: {
  userBolaoId: string
  bolaoId: string
  teamId: number
  teamName: string
  teamLogo: string
}): Promise<ChampionPickResult> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, message: "Unauthorized." }
  }

  const userBolao = await fetchUserBolao({ bolaoId, userId })
  if (!userBolao || userBolao.id !== userBolaoId) {
    return { success: false, message: "Forbidden." }
  }

  const bolao = await fetchBolao(bolaoId)
  const allFixtures = await fetchFixtures({
    leagueId: bolao.competition_id,
    year: bolao.year,
  })

  if (isChampionPickLocked(allFixtures)) {
    return { success: false, message: "Champion pick is locked." }
  }

  try {
    const result = await sql`
      INSERT INTO champion_picks (user_bolao_id, team_id, team_name, team_logo)
      VALUES (${userBolaoId}, ${teamId}, ${teamName}, ${teamLogo})
      ON CONFLICT (user_bolao_id) DO UPDATE SET
        team_id = EXCLUDED.team_id,
        team_name = EXCLUDED.team_name,
        team_logo = EXCLUDED.team_logo,
        updated_at = NOW()
      RETURNING *
    `
    return { ...result.rows[0], success: true }
  } catch (error) {
    console.log(error)
    return { success: false, message: "Database Error: failed to save champion pick." }
  }
}
```

Add `revalidatePath(\`/bolao/${bolaoId}/bet\`)` and `revalidatePath(\`/bolao/${bolaoId}/lead\`)` on success.

Update test mocks at top of `actions.test.ts` to include new data imports.

- [ ] **Step 4: Run tests — verify PASS**

Run: `yarn test app/lib/__tests__/actions.test.ts`

- [ ] **Step 5: Commit**

```bash
git add app/lib/actions.ts app/lib/__tests__/actions.test.ts
git commit -m "feat: add createOrUpdateChampionPick server action"
```

---

### Task 6: Scoring (TDD)

**Files:**
- Modify: `app/lib/calcLeadFactory.ts`
- Modify: `app/lib/__tests__/calcLeadFactory.test.ts`

- [ ] **Step 1: Write failing test for champion bonus**

```typescript
it("adds champion pick bonus when pick matches league winner", () => {
  const players: PlayersData[] = [
    { id: "u1", username: "alice", email: "a@x.com", userBolaoId: "ub-1" },
    { id: "u2", username: "bob", email: "b@x.com", userBolaoId: "ub-2" },
  ]

  const result = calcLead({
    players,
    fixtures: [],
    bets: [],
    championPicks: [
      { user_bolao_id: "ub-1", team_id: 10, team_name: "Brazil", team_logo: "b.png" } as any,
    ],
    leagueWinnerTeamId: 10,
  })

  expect(result.find((r) => r.name === "alice")?.total).toBe(500)
  expect(result.find((r) => r.name === "bob")?.total).toBe(0)
})
```

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Extend `calcLead`**

```typescript
import { ChampionPick } from "./definitions"
import { CHAMPION_PICK_BONUS_POINTS } from "./utils"

export const calcLead = ({
  players,
  fixtures,
  bets,
  championPicks = [],
  leagueWinnerTeamId = null,
}: {
  players: PlayersData[]
  fixtures: FixtureData[]
  bets: Bet[]
  championPicks?: ChampionPick[]
  leagueWinnerTeamId?: number | null
}) => {
  const picksByUserBolaoId = new Map(
    championPicks.map((pick) => [pick.user_bolao_id, pick])
  )

  // ... existing loop ...
  const pick = picksByUserBolaoId.get(player.userBolaoId)
  const championBonus =
    leagueWinnerTeamId !== null && pick?.team_id === leagueWinnerTeamId
      ? CHAMPION_PICK_BONUS_POINTS
      : 0

  total = total + totalMatchDay + championBonus

  lead.push({
    name: player.username || getEmailUsername(player.email),
    total,
    championPick: pick
      ? { id: pick.team_id, name: pick.team_name, logo: pick.team_logo }
      : null,
  })
}
```

- [ ] **Step 4: Run tests — verify PASS**

Run: `yarn test app/lib/__tests__/calcLeadFactory.test.ts`

- [ ] **Step 5: Commit**

```bash
git add app/lib/calcLeadFactory.ts app/lib/__tests__/calcLeadFactory.test.ts
git commit -m "feat: add champion pick bonus to leaderboard scoring"
```

---

### Task 7: Controllers

**Files:**
- Modify: `app/lib/controllerBet.ts`
- Modify: `app/lib/controllerLead.ts`
- Modify: `app/lib/__tests__/controllerBet.test.ts`
- Modify: `app/lib/__tests__/controllerLead.test.ts`

- [ ] **Step 1: Extend `controllerBet.getData`**

Fetch in parallel with existing data:
- `allSeasonFixtures = await fetchFixtures({ leagueId, year })` *(no round)*
- `userChampionPick = await fetchChampionPick(currentUserBolao.id)` *(logged-in user, NOT admin-selected player)*

Return additional fields:

```typescript
championPickTeams: getTeamsFromFixtures(allSeasonFixtures),
isChampionPickLocked: isChampionPickLocked(allSeasonFixtures),
championPickLockDate: getChampionPickLockDate(allSeasonFixtures),
userChampionPick,
allSeasonFixtures, // needed by action lock check; optional to expose to page
```

- [ ] **Step 2: Extend `controllerLead.getData`**

```typescript
import { fetchChampionPicks, fetchLeague } from "./data"
import { getLeagueWinnerTeamId } from "./championPick"
import { isChampionPickLocked } from "./utils"

// inside getData:
const [fixtures, championPicks, league] = await Promise.all([
  fetchFixtures({ leagueId, year }),
  fetchChampionPicks(userBoloesIds),
  fetchLeague(Number(leagueId)),
])

return {
  bolao,
  fixtures,
  players,
  bets,
  championPicks,
  isChampionPickLocked: isChampionPickLocked(fixtures),
  leagueWinnerTeamId: getLeagueWinnerTeamId(league),
}
```

- [ ] **Step 3: Update controller tests** — mock new fetchers; assert new return fields.

- [ ] **Step 4: Run tests**

Run: `yarn test app/lib/__tests__/controllerBet.test.ts app/lib/__tests__/controllerLead.test.ts`

- [ ] **Step 5: Commit**

```bash
git add app/lib/controllerBet.ts app/lib/controllerLead.ts app/lib/__tests__/controllerBet.test.ts app/lib/__tests__/controllerLead.test.ts
git commit -m "feat: expose champion pick state in bet and lead controllers"
```

---

### Task 8: i18n strings

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pt-br.json`

- [ ] **Step 1: Add `championPick` namespace to both files**

`en.json`:

```json
"championPick": {
  "label": "Championship winner",
  "placeholder": "Select a team — optional",
  "selectTeam": "Select championship winner",
  "statusUnlockedNoPick": "Pick the team you think will win. +500 pts if correct. Others' picks hidden until the first game.",
  "statusUnlockedHasPick": "You picked {team}. Change until {date}.",
  "statusLocked": "Picks locked. See everyone's picks on the Lead page.",
  "statusWon": "{team} won! +500 bonus points.",
  "statusLost": "{team} won. Your pick didn't match.",
  "leadColumnHeader": "Winner pick",
  "leadColumnSubtitle": "+500 pts if correct",
  "noPick": "—"
}
```

`pt-br.json`:

```json
"championPick": {
  "label": "Campeão do torneio",
  "placeholder": "Selecione um time — opcional",
  "selectTeam": "Selecionar campeão do torneio",
  "statusUnlockedNoPick": "Escolha o time campeão. +500 pts se acertar. Palpites dos outros ficam ocultos até o primeiro jogo.",
  "statusUnlockedHasPick": "Você escolheu {team}. Pode alterar até {date}.",
  "statusLocked": "Palpites bloqueados. Veja todos no Ranking.",
  "statusWon": "{team} venceu! +500 pontos bônus.",
  "statusLost": "{team} venceu. Seu palpite não bateu.",
  "leadColumnHeader": "Campeão",
  "leadColumnSubtitle": "+500 pts se acertar",
  "noPick": "—"
}
```

- [ ] **Step 2: Commit**

```bash
git add messages/en.json messages/pt-br.json
git commit -m "feat: add champion pick i18n strings"
```

---

### Task 9: ChampionPickSelector component (TDD)

**Files:**
- Create: `app/ui/bolao/bet/championPickSelector.tsx`
- Create: `app/ui/bolao/bet/__tests__/championPickSelector.test.tsx`

Mirror `playerSelector.tsx` structure exactly:

```typescript
"use client"

import { useTranslations } from "next-intl"
import { ChampionTeam, ChampionPick } from "@/app/lib/definitions"
import { createOrUpdateChampionPick } from "@/app/lib/actions"
import { formatDateFixtures } from "@/app/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  bolaoId: string
  userBolaoId: string
  teams: ChampionTeam[]
  userChampionPick: ChampionPick | null
  isLocked: boolean
  lockDate: Date | null
  leagueWinnerTeamId: number | null
  locale: string
}

function ChampionPickSelector({ ... }: Props) {
  const t = useTranslations("championPick")

  const handleChange = async (teamIdStr: string) => {
    const team = teams.find((t) => t.id === Number(teamIdStr))
    if (!team) return
    await createOrUpdateChampionPick({
      userBolaoId,
      bolaoId,
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.logo,
    })
  }

  const statusLine = /* derive from isLocked, userChampionPick, leagueWinnerTeamId, lockDate */

  if (teams.length === 0) return null

  return (
    <div className="mb-4 flex justify-center">
      <div className="w-full max-w-xs">
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          {t("label")}
        </div>
        <Select
          value={userChampionPick ? String(userChampionPick.team_id) : undefined}
          onValueChange={handleChange}
          disabled={isLocked}
        >
          <SelectTrigger aria-label={t("selectTeam")}>
            <SelectValue placeholder={t("placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={String(team.id)}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-muted-foreground">{statusLine}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 1: Write component tests** — renders label, disabled when locked, hidden when no teams, calls action on change.
- [ ] **Step 2: Implement component**
- [ ] **Step 3: Run tests — PASS**

Run: `yarn test app/ui/bolao/bet/__tests__/championPickSelector.test.tsx`

- [ ] **Step 4: Commit**

```bash
git add app/ui/bolao/bet/championPickSelector.tsx app/ui/bolao/bet/__tests__/championPickSelector.test.tsx
git commit -m "feat: add champion pick selector component"
```

---

### Task 10: Bet page integration

**Files:**
- Modify: `app/bolao/[id]/bet/page.tsx`
- Modify: `app/__tests__/bolao/[id]/bet/page.test.tsx` *(if exists)*

- [ ] **Step 1: Render selector below admin PlayerSelector**

```tsx
import ChampionPickSelector from "@/app/ui/bolao/bet/championPickSelector"
import { getLocale } from "next-intl/server"

// inside BetPage, after PlayerSelector block:
{data.championPickTeams.length > 0 && (
  <ChampionPickSelector
    bolaoId={params.id}
    userBolaoId={data.currentUserBolao.id}
    teams={data.championPickTeams}
    userChampionPick={data.userChampionPick}
    isLocked={data.isChampionPickLocked}
    lockDate={data.championPickLockDate}
    leagueWinnerTeamId={null}
    locale={await getLocale()}
  />
)}
```

Note: `userBolaoId` uses `currentUserBolao` (logged-in user), not admin-selected `userBolao`.

- [ ] **Step 2: Run tests + dev smoke test**

Run: `yarn test app/__tests__/bolao/[id]/bet/page.test.tsx`
Run: `yarn dev` → open `/bolao/{id}/bet` → verify two selects stack for admin, one for regular user.

- [ ] **Step 3: Commit**

```bash
git add app/bolao/[id]/bet/page.tsx
git commit -m "feat: add champion pick selector to bet page"
```

---

### Task 11: Lead page column (TDD)

**Files:**
- Modify: `app/ui/bolao/lead/tableLead.tsx`
- Modify: `app/bolao/[id]/lead/page.tsx`
- Modify: `app/ui/bolao/lead/__tests__/tableLead.test.tsx`

- [ ] **Step 1: Write failing test — column hidden before lock, shown after**

```typescript
it("shows winner pick column when locked", async () => {
  render(
    await TableLead({
      data: [{ name: "alice", total: 100, championPick: { id: 10, name: "Brazil", logo: "b.png" } }],
      isChampionPickLocked: true,
    })
  )
  expect(screen.getByText("Winner pick")).toBeInTheDocument()
  expect(screen.getByText("Brazil")).toBeInTheDocument()
})
```

- [ ] **Step 2: Extend `TableLead` props and render column**

Add optional `isChampionPickLocked: boolean`. When true, insert column between player name and score showing team name (or `t("noPick")`).

- [ ] **Step 3: Update `lead/page.tsx`**

```typescript
const sortedLead = [...calcLead({
  players: data.players,
  fixtures: data.fixtures,
  bets: data.bets,
  championPicks: data.championPicks,
  leagueWinnerTeamId: data.leagueWinnerTeamId,
})].sort((a, b) => b.total - a.total)

<TableLead data={sortedLead} isChampionPickLocked={data.isChampionPickLocked} />
```

- [ ] **Step 4: Run tests — PASS**

Run: `yarn test app/ui/bolao/lead/__tests__/tableLead.test.tsx app/__tests__/bolao/[id]/lead/page.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add app/ui/bolao/lead/tableLead.tsx app/bolao/[id]/lead/page.tsx app/ui/bolao/lead/__tests__/tableLead.test.tsx
git commit -m "feat: show champion picks on lead page after lock"
```

---

### Task 12: Final verification

- [ ] **Step 1: Run full test suite**

Run: `yarn test`
Expected: all pass

- [ ] **Step 2: Run lint**

Run: `yarn lint`
Expected: no errors

- [ ] **Step 3: Run production build**

Run: `yarn build`
Expected: success

- [ ] **Step 4: Manual smoke test checklist**

1. Open bet page before first game → champion Select visible, editable
2. Pick a team → persists on refresh
3. Change pick → updates
4. Admin sees two stacked selects (Betting as + Champion winner)
5. After earliest kickoff (mock with fake timers or past fixture data) → Select disabled
6. Lead page before lock → no Winner pick column
7. Lead page after lock → column shows each player's team or "—"
8. When league API has winner → correct pick adds 500 to score total

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| `champion_picks` table | Task 3 |
| Upsert server action with auth + lock | Task 5 |
| Lock at earliest kickoff | Task 2 |
| Teams from fixtures | Task 2 |
| PlayerSelector-style UI on Bet page | Tasks 9–10 |
| Two stacked selects (admin + champion) | Task 10 |
| Lead column after lock | Task 11 |
| +500 bonus at season end | Tasks 1, 6 |
| League API winner resolution | Tasks 2, 7 |
| i18n explanation copy | Task 8 |
| Optional pick, no penalty | Tasks 5, 9 (no required validation) |
| Hidden before lock on Lead | Task 11 |
| Admin pick uses logged-in user | Task 10 (`currentUserBolao`) |
| Edge: no fixtures → hide | Task 9 (`teams.length === 0`) |

## Out of scope (do not implement)

- Dedicated nav tab
- Dismissible banner
- Pick history
- Admin winner override
- "+500" badge on score column
