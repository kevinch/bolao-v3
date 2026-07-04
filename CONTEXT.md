# Bolão.io — Domain Glossary

## Bolão

A private prediction pool created by a user for a specific competition and season. Friends join via invite link. The app tracks predictions and points; it never handles money.

## Member

A user who has joined a bolão. Stored as a `user_bolao` row — one membership per user per bolão.

## Player

UI label for a bolão member when shown in standings, results, or leaderboard contexts.

## Round

A competition stage label from the football API (e.g. `Regular Season - 12`, `Group Stage - 2`, `Round of 16`). The app fetches the season's round list via `fetchRounds`, filters noise with `cleanRounds`, and uses that ordering for Bet and Results pagination. Each fixture carries its round on `fixture.league.round`.

## Position

A member's rank on the bolão leaderboard at a point in time — 1st, 2nd, 3rd, etc. — based on cumulative points. Ties are broken by sort order (same as the Lead tab today); tied members get consecutive ranks, not shared rank.

## Leaderboard snapshot

The ordered set of member ranks and cumulative point totals computed after a defined boundary. Not stored in the database — derived from bets, fixtures, and scoring rules.

For the Statistics tab position-evolution chart, snapshots are taken **at the end of each finished round only** — a round appears on the chart once every fixture in that round has a final result. In-progress rounds are excluded. All members' rank trajectories are visible to everyone in the bolão. When the official champion is known and the +500 pt bonus is awarded, an **extra final snapshot** is appended after the last round (not tied to a new round).

## Scoring tier

One of the six match-prediction point categories applied per finished fixture (highest matching rule wins): exact score (200 pts), winner's goals correct (150 pts), draw predicted (150 pts), winner and loser's goals (120 pts), winner and goal difference (100 pts), winner only (80 pts). Champion pick bonus (+500 pts) is separate from match scoring tiers and is **excluded from the private points breakdown** (tiers only).

## Points breakdown

A Statistics tab view showing how a member's total points split across scoring tiers — counts and percentages by tier, answering *how* points were earned rather than share of the pool. Each member sees their own breakdown plus a **you vs group average** comparison (aggregate percentages only — not other members' individual splits).

## Statistics tab

A bolão sub-page at `/bolao/[id]/stats` (nav label **Stats**, alongside Bet, Standings, Results, Lead) showing analytics derived from existing bets and fixtures — no new database tables in v1. Marked **Beta** with a badge inside the page content (not on the nav link), to avoid crowding the mobile tab bar. All user-visible strings are translated via `next-intl` in `messages/en.json` and `messages/pt-br.json`. v1 includes exactly two sections: (1) public position-evolution chart by finished round, and (2) private per-member scoring-tier breakdown. Before any round is fully finished, show a friendly placeholder message and hide both charts.
