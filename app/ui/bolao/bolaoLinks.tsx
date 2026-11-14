import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ScrollLink from "@/app/ui/bolao/scrollLink"

type Props = {
  bolaoId: string
  active?: number
}

async function BolaoLinks({ bolaoId }: Props) {
  const t = await getTranslations("bolaoLinks")

  return (
    <>
      <div className="flex w-full flex-wrap justify-center gap-4 max-md:flex-nowrap max-md:gap-1">
        <Button
          size="sm"
          asChild
          variant="ghost"
          className="max-md:px-2 max-md:shrink-0"
        >
          <ScrollLink href={`/bolao/${bolaoId}/bet`}>{t("bet")}</ScrollLink>
        </Button>

        <Button
          size="sm"
          asChild
          variant="ghost"
          className="max-md:px-2 max-md:shrink-0"
        >
          <ScrollLink href={`/bolao/${bolaoId}/standings`}>{t("standings")}</ScrollLink>
        </Button>

        <Button
          size="sm"
          asChild
          variant="ghost"
          className="max-md:px-2 max-md:shrink-0"
        >
          <ScrollLink href={`/bolao/${bolaoId}/results`}>{t("results")}</ScrollLink>
        </Button>

        <Button
          size="sm"
          asChild
          variant="ghost"
          className="max-md:px-2 max-md:shrink-0"
        >
          <ScrollLink href={`/bolao/${bolaoId}/lead`}>{t("lead")}</ScrollLink>
        </Button>

        <Button
          size="sm"
          asChild
          variant="ghost"
          className="max-md:px-2 max-md:shrink-0"
        >
          <ScrollLink href={`/bolao/${bolaoId}/stats`}>{t("stats")}</ScrollLink>
        </Button>
      </div>
      <Separator className="my-4" />
    </>
  )
}

export default BolaoLinks
