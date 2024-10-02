import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
        <TooltipProvider>
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
      </span>
      <span className="text-sm">{formatTeamCode(name)}</span>
    </span>
  )
}

export default TeamCodeLogo
