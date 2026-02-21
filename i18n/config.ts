export const locales = ["en", "pt-br"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"
