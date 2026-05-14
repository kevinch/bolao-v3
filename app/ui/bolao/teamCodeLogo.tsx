"use client" // keep this to trigger the popovers on mobile

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { isBrowser } from "react-device-detect"

type Props = {
  name: string
  logoSrc: string
}

const formatTeamCode = (name: string) =>
  name.toUpperCase().replace(" ", "").slice(0, 3)

function TeamCodeLogo({ name, logoSrc }: Props) {
  const [imageError, setImageError] = useState(false)
  const teamCode = useMemo(() => formatTeamCode(name), [name])
  const fallbackLabel = teamCode.charAt(0) || "?"

  useEffect(() => {
    setImageError(false)
  }, [logoSrc])

  const triggerElement =
    imageError || !logoSrc ? (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-slate-200 text-[10px] font-semibold text-slate-500">
        {fallbackLabel}
      </span>
    ) : (
      <Image
        width={100} // Placeholder width
        height={100} // Placeholder height
        className="max-h-5 max-w-5 object-contain"
        src={logoSrc}
        alt={`${name}'s logo`}
        onError={() => setImageError(true)}
      />
    )

  if (isBrowser) {
    return (
      <span className="flex justify-center flex-col mx-3">
        <span className="flex justify-center">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{triggerElement}</TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <span className="text-sm text-center">{teamCode}</span>
      </span>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center justify-center flex-col mx-3">
          {triggerElement}
          <span className="text-sm text-center">{teamCode}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <span>{name}</span>
      </PopoverContent>
    </Popover>
  )
}

export default TeamCodeLogo
