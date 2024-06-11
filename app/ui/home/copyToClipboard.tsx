"use client"

import { useState } from "react"
import clsx from "clsx"
import { buttonClasses } from "../styles"

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
      className={clsx(buttonClasses, {
        "bg-white": !copied,
        "bg-teal-200": copied,
      })}
      onClick={() => handleCopyClipboard()}
    >
      {copied ? "Copied to clipboard" : "Copy invite link"}
    </button>
  )
}

export default CopyToClipboard
