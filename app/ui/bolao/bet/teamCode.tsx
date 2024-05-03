import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

function TeamCode({ children }: Props) {
  return <span>{children}</span>
}

export default TeamCode
