import Link from "next/link"
import { fetchBolao, fetchUserBolao } from "@/app/lib/data"
import PageTitle from "@/app/components/pageTitle"
import { auth } from "@clerk/nextjs/server"
import { createUserBolao } from "@/app/lib/actions"

async function getData({
  bolaoId,
  userId,
}: {
  bolaoId: string
  userId: string
}) {
  const [bolao, userBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUserBolao({ bolaoId, userId }),
  ])

  let resultText: string = "You are already in the bolão."

  if (!userBolao) {
    const data = await createUserBolao(bolaoId)

    if (data.success) {
      // TODO: update to toast
      resultText = "You were added to the bolão with success."
    } else {
      resultText = "Something went wrong while adding you to the bolão."
    }
  }

  return { bolao, resultText }
}

async function InvitePage({ params }: { params: { id: string } }) {
  const { userId }: { userId: string | null } = auth()

  if (!userId) {
    return <p>Error while loading the bolão. Missing userid</p>
  }

  const data: { bolao: { name: string; id: string }; resultText: string } =
    await getData({
      bolaoId: params.id,
      userId,
    })

  if (!data) {
    return <p>Error while adding you to the bolao.</p>
  }

  return (
    <main>
      {/* TODO: format header like bet and standings pages */}
      <PageTitle>Invite for "{data.bolao.name}"</PageTitle>

      <p>{data.resultText}</p>
      <p>
        <Link
          className="underline hover:no-underline"
          href={`/bolao/${data.bolao.id}/bet`}
        >
          Start betting now
        </Link>
      </p>
    </main>
  )
}

export default InvitePage
