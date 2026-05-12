"use client"

import { useTranslations } from "next-intl"
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
import { usePathname, useRouter } from "@/i18n/navigation"

export default function LanguageSwitcher() {
  const t = useTranslations("language")
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function setLocale(locale: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale })
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
