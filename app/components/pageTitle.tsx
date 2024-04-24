import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

function PageTitle({ children }: Props) {
  return <h1 className="text-4xl my-8">{children}</h1>
}

export default PageTitle
