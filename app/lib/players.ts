import { clerkClient } from "@clerk/nextjs/server"
import { PlayersData, UserBolao } from "./definitions"

const CLERK_USER_ID_BATCH_SIZE = 100

export async function fetchClerkUsersByIds(userIds: string[]) {
  if (userIds.length === 0) {
    return []
  }

  const client = await clerkClient()
  const users = []

  for (let i = 0; i < userIds.length; i += CLERK_USER_ID_BATCH_SIZE) {
    const batch = userIds.slice(i, i + CLERK_USER_ID_BATCH_SIZE)
    const result = await client.users.getUserList({
      userId: batch,
      limit: batch.length,
    })
    users.push(...result.data)
  }

  return users
}

export async function getPlayersFromUsersBolao(
  usersBolao: UserBolao[]
): Promise<PlayersData[]> {
  const userIds = usersBolao.map((el) => el.user_id)
  const clerkUsers = await fetchClerkUsersByIds(userIds)

  return clerkUsers.map((el) => {
    const userBolaoObj = usersBolao.find((ub) => ub.user_id === el.id)

    return {
      id: el.id,
      username: el.username,
      email: el.emailAddresses[0]?.emailAddress || "",
      userBolaoId: userBolaoObj?.id || "",
    }
  })
}
