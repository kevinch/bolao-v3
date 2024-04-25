# The new bolao.io app: v3

## Getting Started

Development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

```bash
git push
```

## Tech specs

- Frontend: NextJS - [docs](https://nextjs.org/docs)
- Styling: Tailwind - [docs](https://tailwindcss.com/docs/installation)
- Host: Vercel
- Auth: Clerk - [docs](https://clerk.com/docs/references/nextjs/overview) - [dashboard](https://dashboard.clerk.com/)
- Repo: [/bolaov3-poc-clerk-auth](https://github.com/kevinch/bolaov3-poc-clerk-auth)
- env vars:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY={{@Clerk docs (clerk.com/docs/quickstarts/nextjs) logged in or dashboard}}
CLERK_SECRET_KEY={{@Clerk docs (clerk.com/docs/quickstarts/nextjs) logged in or dashboard}}
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NO_SSL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE

NEXT_PUBLIC_FOOTBALLDATA_TOKEN
```
