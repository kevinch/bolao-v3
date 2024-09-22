# The bolao.io app: v3

## Getting Started

Install:

```bash
yarn
```

Development:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech specs

- Frontend: NextJS - [docs](https://nextjs.org/docs)
- Styling: Tailwind - [docs](https://tailwindcss.com/docs/installation)
- Components: Shadcn UI - [docs](https://ui.shadcn.com/docs/components)
- Icons: radix-ui/icons - [docs](https://www.radix-ui.com/icons)
- Host: Vercel - [site](https://vercel.com)
- Auth: Clerk - [docs](https://clerk.com/docs/references/nextjs/overview) - [dashboard](https://dashboard.clerk.com/)
- Repo: [github.com/kevinch/bolao-v3](https://github.com/kevinch/bolao-v3)
- Data source: [api-football.com](https://www.api-football.com/documentation-v3) - [dashboard](https://dashboard.api-football.com/)
- ENV vars:

```
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NO_SSL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE

RAPID_API_KEY

UMAMI_ID
```
