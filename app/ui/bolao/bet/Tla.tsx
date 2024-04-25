import { ReactNode } from "react"

interface TlaProps {
  children: ReactNode
}

function Tla({ children }: TlaProps) {
  return <span>{children}</span>
}

export default Tla
