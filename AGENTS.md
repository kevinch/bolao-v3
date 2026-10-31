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

### Refresh published Prismic content

Production Prismic fetches (news posts and other documents) are cached with the `prismic` tag. After a publish, force a refresh:

```bash
curl -X POST https://bolao.io/api/revalidate
```

`POST /api/revalidate` revalidates that tag. No secret or body. Local `yarn dev` refetches every 5 seconds and does not use this endpoint. Details are in [README.md](README.md).

## Code style

TBD — follow existing patterns in the codebase and match surrounding files.

## Testing

TBD — prefer adding or updating tests when behavior changes; see `tests/` and Vitest/Playwright config in-repo.

## Secrets and environment

TBD — never commit secrets; use env vars as documented in README.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
