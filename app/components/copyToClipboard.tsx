"use client"

import { useToast } from "@/hooks/use-toast"

type Props = {
  bolaoId: string
}

function CopyToClipboard({ bolaoId }: Props) {
  const { toast } = useToast()

  function handleCopyClipboard() {
    navigator.clipboard.writeText(`${window.location}bolao/${bolaoId}/invite`)

    toast({
      description: "The link was copied to the clipboard.",
    })
  }

  return <button onClick={handleCopyClipboard}>Copy invite link</button>
}

export default CopyToClipboard
