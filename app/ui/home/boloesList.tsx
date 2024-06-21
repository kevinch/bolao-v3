import Link from "next/link"
import { fetchBoloesByUserId } from "@/app/lib/data"
import { auth } from "@clerk/nextjs/server"
import { unstable_noStore as noStore } from "next/cache"
import { Bolao } from "@/app/lib/definitions"
import CopyToClipboard from "./copyToClipboard"
import { STYLES_BOX_SHADOW } from "@/app/lib/utils"

async function getData(userId: string) {
  noStore()

  const result = await fetchBoloesByUserId(userId)

  return result
}

async function BoloesList() {
  const { userId }: { userId: string | null } = auth() // could go to context?

  if (!userId) {
    return
  }

  let data: Bolao[] = []

  if (userId) {
    data = await getData(userId)
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center flex-col space-y-8 uppercase">
        <Link className="underline hover:no-underline" href="/bolao/create">
          Create Bolão
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* TODO: update list after creation */}
      {data.map((el: Bolao) => (
        <div key={el.id} className={STYLES_BOX_SHADOW}>
          <h3 className="text-2xl capitalize mb-4">{el.name}</h3>

          <div className="flex justify-between">
            <div className="space-x-4">
              <Link
                className="underline hover:no-underline"
                href={`/bolao/${el.id}/bet`}
              >
                Bet
              </Link>

              <Link
                className="underline hover:no-underline"
                href={`/bolao/${el.id}/results`}
              >
                Results
              </Link>
            </div>
            <div>
              <CopyToClipboard bolaoId={el.id} />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default BoloesList
