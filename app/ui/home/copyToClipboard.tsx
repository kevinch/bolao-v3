"use client"

type Props = {
  bolaoId: string
}

function CopyToClipboard({ bolaoId }: Props) {
  function handleCopyClipboard() {
    navigator.clipboard.writeText(`${window.location}bolao/${bolaoId}/invite`)
  }

  return (
    <button
      className="border px-2 mx-2 rounded"
      onClick={() => handleCopyClipboard()}
    >
      Invite via link
    </button>
  )
}

export default CopyToClipboard
