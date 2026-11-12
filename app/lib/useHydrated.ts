"use client"

import { useSyncExternalStore } from "react"

function subscribe() {
  return () => {}
}

/**
 * Returns false during SSR and the first client render, then true once
 * hydrated. Lets a component render client-only values (timezone-formatted
 * dates, the resolved theme) without a setState-in-an-effect, which keeps it
 * clear of the react-hooks/set-state-in-effect rule and avoids hydration
 * mismatches.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
