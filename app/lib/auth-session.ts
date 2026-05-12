import { cache } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"

/** One Clerk `auth()` per request (shared by Header, BoloesList, etc.). */
export const getCachedAuth = cache(async () => auth())

/** One Clerk `currentUser()` per request when the full user is needed. */
export const getCachedCurrentUser = cache(async () => currentUser())
