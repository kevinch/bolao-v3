import { ReactNode } from "react"

// A centered, muted message block for page-level states (errors, empty states)
// so they render as an intentional UI rather than raw top-left text. Sits in
// the layout's flex-1 content area, keeping the footer at the viewport bottom.
export default function PageMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 text-center text-muted-foreground">
      {children}
    </div>
  )
}
