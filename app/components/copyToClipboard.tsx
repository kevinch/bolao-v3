"use client"

import { useToast } from "@/hooks/use-toast"

type Props = {
  bolaoId: string
}

function CopyToClipboard({ bolaoId }: Props) {
  const { toast } = useToast()

  async function handleCopyClipboard() {
    try {
      await navigator.clipboard.writeText(
        `${window.location}bolao/${bolaoId}/invite`
      )

      toast({
        title: "Success",
        description: "The link was copied to the clipboard.",
        variant: "success",
      })
    } catch {
      toast({
        description: "Failed to copy the link to the clipboard.",
        variant: "destructive",
      })
    }
  }

  return <button onClick={handleCopyClipboard}>Copy invite link</button>
}

export default CopyToClipboard
