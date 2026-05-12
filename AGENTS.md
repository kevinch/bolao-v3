# AGENTS.md

Guidance for AI coding agents working on the **bolao.io** app in this repository.

## Agent rules

### Git commits (non-negotiable)

Do **not** run `git commit`, amend commits, rebase in a way that rewrites published history, or otherwise create or rewrite git history **without explicit human approval** (for example: the user asked you to commit, or approved a specific commit message and scope).

Suggesting a commit message, summarizing changes, or describing what to stage in chat is fine. **Recording** a commit in git is not, unless the human explicitly approved it.

## Project context

- **Frontend:** Next.js, Tailwind CSS, Shadcn UI, Radix icons.
- **Auth:** Clerk (see README for required `CLERK_*` and sign-in/up URL env vars).
- **Data / infra:** Vercel Postgres (`POSTGRES_*`), Rapid API (`RAPID_API_KEY`), Prismic CMS, optional Umami (`UMAMI_ID`).
- **Testing:** Vitest (`yarn test`), Playwright e2e (`yarn test:e2e`).

For full setup and env var list, see [README.md](README.md).

## Common commands

| Command           | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `yarn`            | Install dependencies                     |
| `yarn dev`        | Dev server (Turbopack)                   |
| `yarn build`      | Production build                         |
| `yarn lint`       | ESLint                                   |
| `yarn test`       | Vitest (run once)                        |
| `yarn test:watch` | Vitest watch mode                        |
| `yarn test:e2e`   | Playwright (installs Chromium if needed) |

## Code style

TBD — follow existing patterns in the codebase and match surrounding files.

## Testing

TBD — prefer adding or updating tests when behavior changes; see `tests/` and Vitest/Playwright config in-repo.

## Secrets and environment

TBD — never commit secrets; use env vars as documented in README.
