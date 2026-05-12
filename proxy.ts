import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"

import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

const isProtectedRoute = createRouteMatcher([
  "/bolao(.*)",
  "/admin(.*)",
  "/home(.*)",
  "/pt-br/bolao(.*)",
  "/pt-br/admin(.*)",
  "/pt-br/home(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  const { userId } = await auth()
  const pathname = req.nextUrl.pathname
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname

  if (userId && (normalized === "/" || normalized === "/pt-br")) {
    const target = normalized === "/pt-br" ? "/pt-br/home" : "/home"
    return NextResponse.redirect(new URL(target, req.url))
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
