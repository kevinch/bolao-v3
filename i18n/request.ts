import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { defaultLocale, locales, type Locale } from "./config"

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerStore = await headers()

  let locale: Locale = defaultLocale

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale
  } else {
    const acceptLanguage = headerStore.get("accept-language")
    if (acceptLanguage) {
      const browserLocale = acceptLanguage
        .split(",")[0]
        .split("-")[0]
        .toLowerCase()
      if (browserLocale === "pt") {
        locale = "pt-br"
      } else if (locales.includes(browserLocale as Locale)) {
        locale = browserLocale as Locale
      }
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
