"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useHydrated } from "@/app/lib/useHydrated"

export function ModeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const t = useTranslations("navigation")
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = useHydrated()

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={showLabel ? "sm" : "icon"}
        className={showLabel ? "h-10 gap-2 px-3" : undefined}
        aria-label={showLabel ? undefined : t("toggleAppearance")}
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
        {showLabel ? <span>{t("light")}</span> : null}
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      className={showLabel ? "h-10 gap-2 px-3" : undefined}
      aria-label={showLabel ? undefined : t("toggleAppearance")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
      )}
      {showLabel ? <span>{t(isDark ? "dark" : "light")}</span> : null}
    </Button>
  )
}
