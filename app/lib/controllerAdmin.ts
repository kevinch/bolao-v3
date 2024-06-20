import { fetchBoloes } from "@/app/lib/data"
import { unstable_noStore as noStore } from "next/cache"

export async function getData() {
  noStore()

  const boloes = await fetchBoloes()

  return {
    boloes,
  }
}

export async function deleteBolao(bolaoId: string) {
  // find bets
  // delete bets
  // find user_boloes
  // delete user boloes
  // delete bolao
}
