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
import { BrowserView, MobileView } from "react-device-detect"

type Props = {
  name: string
  logoSrc: string
}

const formatTeamCode = (name: string) =>
  name.toUpperCase().replace(" ", "").slice(0, 3)

function TeamCodeLogo({ name, logoSrc }: Props) {
  return (
    <span className="flex justify-center flex-col mx-3">
      <span className="flex justify-center">
        <BrowserView>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  width={20}
                  height={20}
                  src={logoSrc}
                  alt={`${name}'s logo`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </BrowserView>
        <MobileView>
          <Popover>
            <PopoverTrigger asChild>
              <Image
                width={20}
                height={20}
                src={logoSrc}
                alt={`${name}'s logo`}
              />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <p>{name}</p>
            </PopoverContent>
          </Popover>
        </MobileView>
      </span>
      <span className="text-sm">{formatTeamCode(name)}</span>
    </span>
  )
}

export default TeamCodeLogo
