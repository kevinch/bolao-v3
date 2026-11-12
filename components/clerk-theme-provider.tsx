"use client"

import * as React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { useHydrated } from "@/app/lib/useHydrated"

type ClerkThemeProviderProps = {
  children: React.ReactNode
  appearance?: React.ComponentProps<typeof ClerkProvider>["appearance"]
  publishableKey?: string
}

export function ClerkThemeProvider({
  children,
  appearance,
  publishableKey,
}: ClerkThemeProviderProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useHydrated()

  if (!mounted) {
    return (
      <ClerkProvider appearance={appearance} publishableKey={publishableKey}>
        {children}
      </ClerkProvider>
    )
  }

  return (
    <ClerkProvider
      appearance={{
        ...appearance,
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
      }}
      publishableKey={publishableKey}
    >
      {children}
    </ClerkProvider>
  )
}
