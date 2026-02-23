"use client"

import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"

type Props = {
  bolaoId: string
}

function CopyToClipboard({ bolaoId }: Props) {
  const t = useTranslations("bolaoCard")
  const { toast } = useToast()

  async function handleCopyClipboard() {
    try {
      await navigator.clipboard.writeText(
        `${window.location}bolao/${bolaoId}/invite`
      )

      toast({
        title: t("copySuccessTitle"),
        description: t("copySuccessMessage"),
        variant: "success",
      })
    } catch {
      toast({
        description: t("copyErrorMessage"),
        variant: "destructive",
      })
    }
  }

  return <button onClick={handleCopyClipboard}>{t("copyInviteLink")}</button>
}

export default CopyToClipboard
