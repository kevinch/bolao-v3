import { clerkClient } from "@clerk/nextjs/server"

export async function getUserRole(userId: string): Promise<string> {
  try {
    const client = await clerkClient()
    const userData = await client.users.getUser(userId)
    const role = userData.privateMetadata?.role
    return typeof role === "string" ? role : "guest"
  } catch (error) {
    console.error("Failed to fetch user role from Clerk:", error)
    return "guest"
  }
}
