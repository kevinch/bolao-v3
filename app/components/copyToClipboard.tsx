"use client"

import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"
import { copyText } from "@/app/lib/copyText"

type Props = {
  bolaoId: string
}

function CopyToClipboard({ bolaoId }: Props) {
  const t = useTranslations("bolaoCard")
  const { toast } = useToast()

  async function handleCopyClipboard() {
    try {
      await copyText(
        new URL(`/bolao/${bolaoId}/invite`, window.location.href).toString()
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
