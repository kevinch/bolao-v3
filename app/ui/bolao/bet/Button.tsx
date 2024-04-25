import { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
}

function Button({ children }: ButtonProps) {
  return (
    <button className="border px-2 mx-2 rounded bg-slate-50">{children}</button>
  )
}

export default Button
