import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type Props = {
  bolaoId: string
  active?: number
}

function BolaoLinks({ bolaoId }: Props) {
  return (
    <>
      <div className="flex justify-center space-x-4 _mb-10">
        <Button size="sm" asChild variant="ghost">
          <Link href={`/bolao/${bolaoId}/bet`}>BET</Link>
        </Button>

        <Button size="sm" asChild variant="ghost">
          <Link href={`/bolao/${bolaoId}/standings`}>STANDINGS</Link>
        </Button>

        <Button size="sm" asChild variant="ghost">
          <Link href={`/bolao/${bolaoId}/results`}>RESULTS</Link>
        </Button>

        <Button size="sm" asChild variant="ghost">
          <Link href={`/bolao/${bolaoId}/lead`}>LEAD</Link>
        </Button>
      </div>
      <Separator className="my-4" />
    </>
  )
}

export default BolaoLinks
