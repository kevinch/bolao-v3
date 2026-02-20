import { headers } from "next/headers"
import en from "@/messages/en.json"
import ptBR from "@/messages/pt-BR.json"

const messages = { en, "pt-BR": ptBR } as const
type Locale = keyof typeof messages

export type Messages = typeof en

export async function getMessages(): Promise<Messages> {
  const headersList = await headers()
  const acceptLang = headersList.get("accept-language") ?? ""

  // If browser language starts with "pt", use pt-BR. Otherwise, default to en.
  const locale: Locale = acceptLang.toLowerCase().startsWith("pt")
    ? "pt-BR"
    : "en"

  return messages[locale]
}
