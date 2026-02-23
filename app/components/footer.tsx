"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import BackgroundStripes from "./backgroundStripes"
import LanguageSwitcher from "./languageSwitcher"

function Footer() {
  const t = useTranslations("common")

  return (
    <footer className="mt-20 text-sm">
      <div className="flex space-x-0 mb-4 justify-center items-center">
        <Button asChild variant="ghost">
          <Link href="/">{t("home")}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/bolao/create">{t("createBolao")}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/about">{t("about")}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/news">{t("news")}</Link>
        </Button>
        <LanguageSwitcher />
      </div>
      <BackgroundStripes />
    </footer>
  )
}

export default Footer
