import { ReactNode } from "react"

interface TeamCodeProps {
  children: ReactNode
}

function TeamCode({ children }: TeamCodeProps) {
  return <span>{children}</span>
}

export default TeamCode
