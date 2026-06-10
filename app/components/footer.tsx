"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import BackgroundStripes from "./backgroundStripes"
import LanguageSwitcher from "./languageSwitcher"

const footerLinkClassName = "px-2 sm:px-3"

function Footer() {
  const t = useTranslations("common")

  return (
    <footer className="mt-20 text-sm">
      <div className="flex space-x-0 mb-4 justify-center items-center">
        <Button asChild variant="ghost" className={footerLinkClassName}>
          <Link href="/">{t("home")}</Link>
        </Button>
        <Button asChild variant="ghost" className={footerLinkClassName}>
          <Link href="/bolao/create">{t("createBolao")}</Link>
        </Button>
        <Button asChild variant="ghost" className={footerLinkClassName}>
          <Link href="/about">{t("about")}</Link>
        </Button>
        <Button asChild variant="ghost" className={footerLinkClassName}>
          <Link href="/news">{t("news")}</Link>
        </Button>
        <Button asChild variant="ghost" className={footerLinkClassName}>
          <Link href="/faq">{t("faq")}</Link>
        </Button>
        <LanguageSwitcher />
      </div>
      <BackgroundStripes />
    </footer>
  )
}

export default Footer
