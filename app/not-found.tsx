import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"

// Custom 404 so the page renders inside the app layout (header + sticky
// footer). The Next.js default forces a full-viewport height, which pushed the
// footer below the fold.
async function NotFound() {
  const t = await getTranslations("notFound")

  return (
    <main className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold">404</span>
        <span className="h-10 w-px bg-border" aria-hidden="true" />
        <p className="text-muted-foreground">{t("message")}</p>
      </div>

      <Button asChild variant="outline">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </main>
  )
}

export default NotFound
