import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

function PageTitle({ children }: Props) {
  return <h1 className="text-5xl my-24 capitalize">{children}</h1>
}

export default PageTitle
