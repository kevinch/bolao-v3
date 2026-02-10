"use client"

import React, { useState } from "react"
import Image from "next/image"

type TeamCrestProps = {
  src: string
  alt: string
}

export function TeamCrest({ src, alt }: TeamCrestProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError || !src) {
    return (
      <div className="inline-flex mr-2 h-5 w-5 items-center justify-center bg-slate-200 rounded-sm">
        <span className="text-[10px] font-semibold text-slate-500">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      width={100}
      height={100}
      className="inline mr-2 max-h-5 max-w-5 object-contain"
      alt={alt}
      onError={() => setImageError(true)}
    />
  )
}
