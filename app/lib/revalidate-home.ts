import { revalidatePath } from "next/cache"

import { routing } from "@/i18n/routing"

/** Invalidate public marketing home and per-locale roots + signed-in dashboards. */
export function revalidateHomeRoutes() {
  revalidatePath("/")
  revalidatePath("/home")
  for (const locale of routing.locales) {
    if (locale !== routing.defaultLocale) {
      revalidatePath(`/${locale}`)
      revalidatePath(`/${locale}/home`)
    }
  }
}
