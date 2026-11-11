import { ReloadIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

/**
 * Shared loading spinner for buttons and inline loading states. Use the same
 * component everywhere a button shows a pending/loading state so the look stays
 * consistent. Add `mr-2` when it sits before button text.
 */
export default function Spinner({ className }: { className?: string }) {
  return (
    <ReloadIcon
      className={cn("h-4 w-4 animate-spin", className)}
      aria-hidden="true"
    />
  )
}
