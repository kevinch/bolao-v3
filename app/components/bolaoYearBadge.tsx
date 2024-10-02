import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import type { Bolao } from "@/app/lib/definitions"

function BolaoYearBadge({ bolao }: { bolao: Bolao }) {
  let bolaoDate = bolao.year.toString()

  if (bolao.start && bolao.end) {
    const startYear = new Date(bolao.start).getFullYear()
    const endYear = new Date(bolao.end).getFullYear()

    if (startYear < endYear) {
      bolaoDate = `${format(bolao.start, "yyyy", {})}/${format(bolao.end, "yyyy", {})}`
    }
  }

  return <Badge variant="outline">{bolaoDate}</Badge>
}

export default BolaoYearBadge
