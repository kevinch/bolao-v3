import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { fetchUserBolao } from "./data"
import { getUserRole } from "./authRole"

/**
 * Ensures the current user may view the given bolão: they must be a member of
 * it, or an admin. Non-members (and unauthenticated callers) get a 404 via
 * notFound() so a bolão's existence is never revealed by its id. Returns the
 * caller's userId on success.
 */
export async function requireBolaoAccess(bolaoId: string): Promise<string> {
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  if ((await getUserRole(userId)) === "admin") {
    return userId
  }

  const membership = await fetchUserBolao({ bolaoId, userId })

  if (!membership) {
    notFound()
  }

  return userId
}
