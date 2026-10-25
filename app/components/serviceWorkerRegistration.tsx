"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.info("Service workers are not supported in this browser.")
      return
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.info("PushAlert service worker registered:", registration.scope)
        })
        .catch((error: unknown) => {
          console.error("PushAlert service worker registration failed:", error)
        })
    }

    if (document.readyState === "complete") {
      registerServiceWorker()
      return
    }

    window.addEventListener("load", registerServiceWorker, { once: true })
    return () => window.removeEventListener("load", registerServiceWorker)
  }, [])

  return null
}
