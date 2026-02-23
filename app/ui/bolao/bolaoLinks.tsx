import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type Props = {
  bolaoId: string
  active?: number
}

async function BolaoLinks({ bolaoId }: Props) {
  const t = await getTranslations("bolaoLinks")

  return (
    <>
      <div className="flex justify-center space-x-4">
        <Button size="sm" asChild variant="ghost">
          <Link href={`/bolao/${bolaoId}/bet`}>{t("bet")}</Link>
        </Button>

        <Button size="sm" asChild variant="ghost">
          <Link href={`/bolao/${bolaoId}/standings`}>{t("standings")}</Link>
        </Button>

        <Button size="sm" asChild variant="ghost">
          <Link href={`/bolao/${bolaoId}/results`}>{t("results")}</Link>
        </Button>

        <Button size="sm" asChild variant="ghost">
          <Link href={`/bolao/${bolaoId}/lead`}>{t("lead")}</Link>
        </Button>
      </div>
      <Separator className="my-4" />
    </>
  )
}

export default BolaoLinks
