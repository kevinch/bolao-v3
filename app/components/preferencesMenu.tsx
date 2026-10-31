"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  GlobeIcon,
  MixerHorizontalIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { locales, type Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"

function usePreferences() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [isPending, startTransition] = useTransition()

  function setLocale(nextLocale: string) {
    if (!locales.includes(nextLocale as Locale)) return

    // next-intl: persist locale on user action (not during render)
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`
    startTransition(() => {
      router.refresh()
    })
  }

  return {
    locale,
    theme: resolvedTheme === "dark" ? "dark" : "light",
    setLocale,
    setTheme,
    isPending,
  }
}

export function PreferencesMenu() {
  const t = useTranslations("navigation")
  const language = useTranslations("language")
  const preferences = usePreferences()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-11 gap-2 px-2 font-normal"
          aria-label={t("preferences")}
        >
          <MixerHorizontalIcon className="h-4 w-4" aria-hidden />
          <span>{t("preferences")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("preferences")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <GlobeIcon aria-hidden />
          {t("language")}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preferences.locale}
          onValueChange={preferences.setLocale}
        >
          {locales.map((locale) => (
            <DropdownMenuRadioItem
              key={locale}
              value={locale}
              disabled={preferences.isPending}
            >
              {language(locale)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {preferences.theme === "dark" ? (
            <MoonIcon aria-hidden />
          ) : (
            <SunIcon aria-hidden />
          )}
          {t("appearance")}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preferences.theme}
          onValueChange={preferences.setTheme}
        >
          <DropdownMenuRadioItem value="light">
            {t("light")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            {t("dark")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MobilePreferences() {
  const t = useTranslations("navigation")
  const language = useTranslations("language")
  const preferences = usePreferences()

  return (
    <section aria-labelledby="mobile-preferences-title" className="space-y-5">
      <h2
        id="mobile-preferences-title"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {t("preferences")}
      </h2>
      <fieldset className="space-y-2">
        <legend className="mb-2 flex items-center gap-2 text-sm font-medium">
          <GlobeIcon aria-hidden />
          {t("language")}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {locales.map((locale) => (
            <Button
              key={locale}
              type="button"
              variant={preferences.locale === locale ? "secondary" : "outline"}
              className="h-11 justify-start px-3"
              aria-pressed={preferences.locale === locale}
              disabled={preferences.isPending}
              onClick={() => preferences.setLocale(locale)}
            >
              {language(locale)}
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="mb-2 flex items-center gap-2 text-sm font-medium">
          {preferences.theme === "dark" ? (
            <MoonIcon aria-hidden />
          ) : (
            <SunIcon aria-hidden />
          )}
          {t("appearance")}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(["light", "dark"] as const).map((theme) => (
            <Button
              key={theme}
              type="button"
              variant={preferences.theme === theme ? "secondary" : "outline"}
              className={cn("h-11 justify-start px-3")}
              aria-pressed={preferences.theme === theme}
              onClick={() => preferences.setTheme(theme)}
            >
              {t(theme)}
            </Button>
          ))}
        </div>
      </fieldset>
    </section>
  )
}
