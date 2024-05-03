"use client"

import { useState } from "react"
import clsx from "clsx"

type Props = {
  bolaoId: string
}

function CopyToClipboard({ bolaoId }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopyClipboard() {
    navigator.clipboard.writeText(`${window.location}bolao/${bolaoId}/invite`)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  return (
    <button
      className={clsx(
        "border px-2 mx-2 rounded transition-colors duration-200 ease-in-out",
        {
          "bg-white": !copied,
          "bg-teal-200": copied,
        }
      )}
      onClick={() => handleCopyClipboard()}
    >
      {copied ? "Copied to clipboard" : "Copy invite link"}
    </button>
  )
}

export default CopyToClipboard
