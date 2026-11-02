# AGENTS.md

Guidance for AI coding agents working on the **bolao.io** app in this repository.

## Agent rules

### Git commits (non-negotiable)

Do **not** run `git commit`, amend commits, rebase in a way that rewrites published history, or otherwise create or rewrite git history **without explicit human approval** (for example: the user asked you to commit, or approved a specific commit message and scope).

Suggesting a commit message, summarizing changes, or describing what to stage in chat is fine. **Recording** a commit in git is not, unless the human explicitly approved it.

## Project context

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Shadcn UI (`components/ui`), Radix icons, Recharts for charts.
- **i18n:** `next-intl`. Every user-visible string goes in **both** `messages/en.json` and `messages/pt-br.json`; config lives in `i18n/`.
- **Auth:** Clerk. Route protection is in `proxy.ts` (the Next 16 name for middleware); `/bolao(.*)` and `/admin(.*)` require sign-in.
- **Data / infra:** Vercel Postgres via `@vercel/postgres` (`POSTGRES_*`), api-football via Rapid API (`RAPID_API_KEY`), Prismic CMS, Resend for contact-form email, optional Umami (`NEXT_PUBLIC_UMAMI_ID`), PushAlert pilot (`PUSHALERT_TEST_USER_ID`). Hosted on Vercel.
- **Testing:** Vitest (`yarn test`), Playwright e2e (`yarn test:e2e`).

For full setup and env var list, see [README.md](README.md).

## Where to look

- **[CONTEXT.md](CONTEXT.md):** domain glossary (bolão, member, round, scoring tiers, champion pick, Stats tab). Read it before changing scoring, standings or stats logic, and use its terms.
- **`docs/adr/`:** architecture decisions (e.g. Recharts for the Stats tab).
- **`docs/superpowers/`:** feature specs and plans (e.g. championship winner pick).
- **`docs/planning/`:** longer-running plans (e.g. performance).

## Common commands

| Command              | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `yarn`               | Install dependencies                     |
| `yarn dev`           | Dev server (Turbopack)                   |
| `yarn build`         | Production build                         |
| `yarn lint`          | ESLint                                   |
| `yarn test`          | Vitest (run once)                        |
| `yarn test:watch`    | Vitest watch mode                        |
| `yarn test:coverage` | Vitest with v8 coverage                  |
| `yarn test:e2e`      | Playwright (installs Chromium if needed) |
| `yarn seed`          | Seed the database (`scripts/seed.js`)    |
| `yarn slicemachine`  | Prismic Slice Machine for editing slices |

### Refresh published Prismic content

Production Prismic fetches (news posts and other documents) are cached with the `prismic` tag. After a publish, force a refresh:

```bash
curl -X POST https://bolao.io/api/revalidate
```

`POST /api/revalidate` revalidates that tag. No secret or body. Local `yarn dev` refetches every 5 seconds and does not use this endpoint. Details are in [README.md](README.md).

## Code style

- **Formatting:** Prettier (`.prettierrc`): no semicolons, double quotes, 2-space indent, ES5 trailing commas.
- **Linting:** `eslint-config-next/core-web-vitals`, including the React hooks rules. `yarn lint` must pass; CI runs it on every PR.
- **Imports:** use the `@/` path alias (e.g. `@/app/lib/definitions`).
- **Layout:** pages and routes in `app/`; feature UI in `app/ui/<area>/`; server logic in `app/lib/`. There, `data.ts` holds read queries, `actions.ts` holds server actions (both `"use server"`, raw SQL via `sql` from `@vercel/postgres`), `controller*.ts` assembles page data and `*Factory.ts` holds pure calculations (scores, lead, stats). Shared types go in `app/lib/definitions.ts`.
- Otherwise, follow existing patterns and match surrounding files.

## Testing

- **Unit tests (Vitest + Testing Library, jsdom):** in `__tests__/` folders next to the code they cover (e.g. `app/lib/__tests__/`). Shared setup is in `tests/setup.ts`. Add or update tests when behavior changes, especially for scoring and stats logic.
- **E2E (Playwright):** `tests/e2e/`, against `http://localhost:3000`. Needs `.env.test` with test credentials; copy it from `.env.test.example`.
- **Git hooks:** `pre-push` runs `yarn test` **and** `yarn test:e2e`, so a push is slow and fails without `.env.test`.
- **CI on every PR:** lint, unit tests, coverage report, dependency review, security audit, plus a Vercel preview build.

## Secrets and environment

- Never commit secrets. `.env`, `.env*.local` and `.env.test` are gitignored.
- The full env var list is in [README.md](README.md). Only `NEXT_PUBLIC_*` vars reach the browser; keep everything else server-side.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
