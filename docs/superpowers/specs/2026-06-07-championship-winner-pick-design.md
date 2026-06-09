# Championship Winner Pick — Design Spec

**Date:** 2026-06-07  
**Branch:** `feature/championship-winner-pick`  
**Status:** Approved (brainstorming)

## Summary

Each member of a bolão (group) may optionally pick one team they believe will win the championship. Picks can be changed freely until the scheduled kickoff of the earliest fixture in the season. Other members' picks remain hidden until that lock moment, then are revealed on the Bet page and Lead page. Correct picks earn **500 bonus points** added to the leaderboard total once the official championship winner is known via the League API.

## Requirements (decided)

| Decision | Choice |
|----------|--------|
| Scoring | +500 bonus points for correct pick (configurable constant) |
| Change before lock | Yes — update freely until lock |
| Visibility before lock | Hidden — only your own pick visible to you |
| Visibility after lock | Revealed — all picks visible on Bet page and Lead page |
| Required? | Optional — no penalty for skipping |
| UI location (v1) | Section on existing Bet page; revealed picks also on Lead page |
| Lock trigger | Scheduled kickoff of earliest season fixture (even if status is still `NS`) |
| Bonus awarded | Only when official winner is known at season end |
| Team list source | Unique teams derived from all season fixtures |
| Winner resolution | League API `winner` field on current season (handles leagues and knockouts) |

## Architecture

### Approach

Dedicated `champion_picks` table (Approach 1). Keeps champion picks separate from match bets, enforces one pick per user per bolão, and avoids overloading the `bets` table or `user_bolao` membership row.

### Data model

**New table: `champion_picks`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | auto-generated via `uuid_generate_v4()` |
| `user_bolao_id` | VARCHAR | references `user_bolao.id`, **UNIQUE** |
| `team_id` | INTEGER | api-football team ID |
| `team_name` | VARCHAR | denormalized for display |
| `team_logo` | VARCHAR | denormalized logo URL |
| `created_at` | TIMESTAMP | first save |
| `updated_at` | TIMESTAMP | last change |

**Migration:** add to `scripts/seed.js` (and any production migration path used by the project).

**New constant:** `CHAMPION_PICK_BONUS_POINTS = 500` in `app/lib/utils.ts`.

**New types** in `app/lib/definitions.ts`:

- `ChampionPick` — row shape
- `ChampionPickResult` — server action result (success | error)
- Extend `LeadData` with optional `championPick?: { teamId: number; teamName: string; teamLogo: string }`

### Server actions (`app/lib/actions.ts`)

- `createOrUpdateChampionPick({ userBolaoId, teamId, teamName, teamLogo })`
  - Authenticate via `auth()`
  - Verify caller owns the `user_bolao_id`
  - Reject if champion pick is locked (server-side enforcement)
  - Upsert into `champion_picks`

### Data fetchers (`app/lib/data.ts`)

- `fetchChampionPick(userBolaoId: string)` — single pick
- `fetchChampionPicks(userBolaoIds: string[])` — all picks for a bolao

### Utilities (`app/lib/utils.ts`)

- `isChampionPickLocked(fixtures: FixtureData[]): boolean` — `Date.now() >= earliest fixture kickoff`
- `getChampionPickLockDate(fixtures: FixtureData[]): Date | null` — for status messages
- `getTeamsFromFixtures(fixtures: FixtureData[]): Team[]` — dedupe home/away by `team.id`, sort alphabetically by name

## Lock logic & visibility

```
earliestKickoff = sortFixtures(allSeasonFixtures)[0].fixture.date
isLocked = now >= earliestKickoff
```

| State | Own pick (Bet page) | Others' picks (Bet page) | Lead page column |
|-------|---------------------|--------------------------|------------------|
| Before lock | Visible + editable | Hidden | Column hidden |
| After lock, no winner yet | Visible, read-only | Revealed | Column shown |
| After winner known | Visible, read-only | Revealed | Column shown; bonus in score |

**Server-side enforcement:** lock check in `createOrUpdateChampionPick` — UI disable alone is insufficient.

## UI

### Bet page — `ChampionPickSection`

New component rendered in the **same slot as the admin "Betting as" selector** — centered above `TableMatchDayBets`, between `Pagination` and the match cards. Reuses the `PlayerSelector` layout pattern (not a separate card or team grid).

**Layout (matches `PlayerSelector`):**

```
<div className="mb-4 flex justify-center">
  <div className="w-full max-w-xs">
    <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
    <Select … />
    <p className="mt-1 text-xs text-muted-foreground">{statusLine}</p>
  </div>
</div>
```

- **Label:** e.g. "Championship winner" (i18n)
- **Select:** Shadcn `Select` with one option per team (team name in trigger; optional small crest in `SelectItem`)
- **Status line:** contextual helper text below the dropdown (rules summary when unlocked; lock/winner message when locked)

**When unlocked (all members, not admin-only):**

- Dropdown enabled; selecting a team saves immediately via `createOrUpdateChampionPick`
- Placeholder: "Select a team — optional"
- Current pick shown as selected value; user can change freely until lock

**When locked:**

- Dropdown disabled/read-only, showing the user's pick
- Status line: picks are locked; others' picks visible on Lead page
- No inline list of all members' picks on Bet page in v1 — Lead page is the group reveal surface

**When no season fixtures exist:** hide section entirely.

**Admin coexistence:** two stacked selects in the same area is intentional and accepted — admin `PlayerSelector` first (admin only), champion pick `Select` below (all members).

**Controller:** extend `controllerBet.getData` to return `{ championPicks, isChampionPickLocked, lockDate, teams, userChampionPick }`.

### Lead page — revealed picks column

Extend `TableLead` with a **"Winner pick"** column when `isChampionPickLocked === true`.

- Each row: team crest + name, or "—" if no pick
- Column header subtitle explains +500 pts bonus (i18n)
- Score column includes match-bet points + champion bonus when winner is known (no separate "+500" badge in v1 — bonus is silent in the total)

**Controller:** extend `controllerLead.getData` to fetch champion picks, lock state, and league winner.

### User-facing explanation (i18n)

Add `championPick` namespace to `messages/en.json` and `messages/pt-br.json`.

**Bet page selector (compact, below dropdown):**

- **Label:** "Championship winner"
- **Placeholder:** "Select a team — optional"
- **Contextual status lines (small muted text under Select):**
  - Unlocked, no pick: "Pick the team you think will win. +500 pts if correct. Others' picks hidden until the first game."
  - Unlocked, has pick: "You picked {team}. Change until {date}."
  - Locked, pre-winner: "Picks locked. See everyone's picks on the Lead page."
  - Season ended, correct: "{team} won! +500 bonus points."
  - Season ended, incorrect: "{team} won. Your pick didn't match."

**Lead page:**

- Column header: "Winner pick"
- Subtitle: "Bonus pick made before the championship started (+500 pts if correct)."

Portuguese equivalents in `pt-br.json`.

No separate help page or dismissible banner in v1.

## Scoring

Extend `calcLead` in `app/lib/calcLeadFactory.ts`:

```typescript
total = matchBetPoints + (pick?.teamId === leagueWinnerTeamId ? CHAMPION_PICK_BONUS_POINTS : 0)
```

**Winner resolution:** `fetchLeague(bolao.competition_id)` → current season → read official `winner` team ID. Award bonus only when winner is non-null.

**Before winner known:** bonus = 0 for all players; picks visible after lock but do not affect score yet.

## Error handling & edge cases

| Case | Behavior |
|------|----------|
| No fixtures yet | Hide champion pick section |
| User joins after lock | See others' picks; cannot create own pick |
| User never picked | Show "—"; no penalty |
| API winner unavailable at season end | No bonus awarded; log warning; picks remain visible |
| Admin "betting as" another player | Champion pick always tied to logged-in user's `user_bolao_id` (admin override applies to match bets only) |

## Testing

- **Unit:** `isChampionPickLocked`, `getChampionPickLockDate`, `getTeamsFromFixtures`, `calcLead` with champion bonus
- **Actions:** reject upsert when locked; allow when unlocked; auth ownership check
- **Components:** `ChampionPickSection` — editable vs read-only; Lead column hidden before lock, shown after
- **Controllers:** extend existing `controllerBet` and `controllerLead` test coverage

## Out of scope (v1)

- Dedicated nav tab for champion picks
- Dismissible first-visit banner / onboarding
- Pick history / audit trail
- Admin manual winner override
- Separate "+500" badge on Lead page score column
- Per-bolão configurable bonus points (global constant only)

## Files to create or modify (implementation reference)

| File | Change |
|------|--------|
| `scripts/seed.js` | Add `champion_picks` table |
| `app/lib/definitions.ts` | New types |
| `app/lib/utils.ts` | Constants + lock/team helpers |
| `app/lib/data.ts` | Fetch champion picks |
| `app/lib/actions.ts` | `createOrUpdateChampionPick` |
| `app/lib/calcLeadFactory.ts` | Champion bonus in scoring |
| `app/lib/controllerBet.ts` | Return champion pick data |
| `app/lib/controllerLead.ts` | Return champion picks + winner |
| `app/ui/bolao/bet/championPickSection.tsx` | New component |
| `app/bolao/[id]/bet/page.tsx` | Render section |
| `app/ui/bolao/lead/tableLead.tsx` | Winner pick column |
| `app/bolao/[id]/lead/page.tsx` | Pass new props |
| `messages/en.json`, `messages/pt-br.json` | i18n strings |
| Tests | As listed above |
