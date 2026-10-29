"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
} from "next-themes"
import { themeColors } from "@/app/lib/themeColors"

function ThemeColorUpdater() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    const color = resolvedTheme === "dark" ? themeColors.dark : themeColors.light

    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", color))
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorUpdater />
      {children}
    </NextThemesProvider>
  )
}
