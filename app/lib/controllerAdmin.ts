import { fetchBoloes } from "@/app/lib/data"
import { unstable_noStore as noStore } from "next/cache"

export async function getData() {
  noStore()

  const boloes = await fetchBoloes()

  return {
    boloes,
  }
}
