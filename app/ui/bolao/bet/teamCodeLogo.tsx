import Image from "next/image"

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
        <Image width={20} height={20} src={logoSrc} alt={`${name}'s logo`} />
      </span>
      <span className="text-sm">{formatTeamCode(name)}</span>
    </span>
  )
}

export default TeamCodeLogo
