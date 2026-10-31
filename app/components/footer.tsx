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
    <footer className="mt-20 border-t text-sm">
      <nav
        aria-label={t("footerNavigation")}
        className="flex flex-wrap items-center justify-center gap-1 py-5"
      >
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
      </nav>
      <div className="flex flex-wrap items-center justify-center gap-1 border-t py-4">
        <LanguageSwitcher showLabel />
        <ModeToggle showLabel />
      </div>
      <BackgroundStripes />
    </footer>
  )
}

export default Footer
