"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import BackgroundStripes from "./backgroundStripes"
import LanguageSwitcher from "./languageSwitcher"
import { ModeToggle } from "@/components/mode-toggle"

const footerLinkClassName = "px-2 sm:px-3"

function Footer() {
  const t = useTranslations("common")

  return (
    <footer className="mt-20 text-sm">
      <div className="mb-4 flex flex-wrap justify-center items-center gap-1">
        <div className="flex flex-wrap justify-center items-center gap-1">
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
          <Button asChild variant="ghost" className={footerLinkClassName}>
            <Link href="/contact">{t("contact")}</Link>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
      <BackgroundStripes />
    </footer>
  )
}

export default Footer
