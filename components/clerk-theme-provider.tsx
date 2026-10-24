"use client"

import * as React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

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
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

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
