"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { GlobeIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { locales, type Locale } from "@/i18n/config"

export default function LanguageSwitcher() {
  const t = useTranslations("language")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function setLocale(locale: Locale) {
    // next-intl: persist locale on user action (not during render)
    // eslint-disable-next-line react-hooks/immutability -- document.cookie is the intended API
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          aria-label={t("switchTo")}
        >
          <GlobeIcon className="h-4 w-4 text-foreground" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => setLocale(locale)}>
            {t(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
