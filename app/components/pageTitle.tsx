import { ReactNode } from "react"
import clsx from "clsx"

type Props = {
  children: ReactNode
  center?: boolean
  subTitle?: string | number
}

function PageTitle({ children, center, subTitle }: Props) {
  return (
    <div className="capitalize mt-24 mb-20">
      <h1 className={clsx("text-4xl ", { "text-center": center })}>
        {children}
      </h1>
      {subTitle && (
        <div className={clsx("text-2xl", { "text-center": center })}>
          {subTitle}
        </div>
      )}
    </div>
  )
}

export default PageTitle
