"use client"

import { useEffect } from "react"

export default function ServiceWorkerUnregister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
        })
      })
    }
  }, [])

  return null
}
