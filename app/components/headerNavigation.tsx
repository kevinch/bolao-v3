"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { MobilePreferences, PreferencesMenu } from "./preferencesMenu"
import UserButtonWrapper from "./userButtonWrapper"

type HeaderNavigationProps = {
  isSignedIn: boolean
}

type NavigationLink = {
  href: string
  label: string
  match?: "exact" | "prefix"
}

function isActivePath(pathname: string, link: NavigationLink) {
  if (link.match === "prefix") {
    return pathname === link.href || pathname.startsWith(`${link.href}/`)
  }

  return pathname === link.href
}

function NavigationLink({
  link,
  pathname,
  mobile = false,
}: {
  link: NavigationLink
  pathname: string
  mobile?: boolean
}) {
  const active = isActivePath(pathname, link)

  const anchor = (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center border-b text-sm transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
        mobile ? "w-full px-1 text-base" : "px-2",
        active
          ? "border-foreground font-semibold text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {link.label}
    </Link>
  )

  return mobile ? <SheetClose asChild>{anchor}</SheetClose> : anchor
}

export default function HeaderNavigation({
  isSignedIn,
}: HeaderNavigationProps) {
  const pathname = usePathname()
  const common = useTranslations("common")
  const t = useTranslations("navigation")

  const publicLinks: NavigationLink[] = [
    { href: "/about", label: common("about") },
    { href: "/news", label: common("news"), match: "prefix" },
    { href: "/faq", label: common("faq") },
  ]
  const memberLinks: NavigationLink[] = [
    { href: "/", label: common("home") },
    { href: "/bolao/create", label: t("createBolao") },
  ]
  const mobileSecondaryLinks: NavigationLink[] = [
    ...publicLinks,
    { href: "/contact", label: common("contact") },
  ]
  const visitorMobileLinks: NavigationLink[] = [
    { href: "/", label: common("home") },
    ...mobileSecondaryLinks,
  ]

  return (
    <div className="flex items-center gap-1.5">
      <div className="hidden min-w-0 items-center gap-1 md:flex">
        <nav
          aria-label={t("primaryNavigation")}
          className="flex items-center gap-1"
        >
          {(isSignedIn ? memberLinks : publicLinks).map((link) => (
            <NavigationLink key={link.href} link={link} pathname={pathname} />
          ))}
        </nav>
        <PreferencesMenu />
        {!isSignedIn ? (
          <>
            <Button asChild variant="ghost" size="sm" className="h-11 px-2">
              <Link href="/sign-in">{t("login")}</Link>
            </Button>
            <Button asChild size="sm" className="ml-1 h-9 px-3">
              <Link href="/sign-up">{t("getStarted")}</Link>
            </Button>
          </>
        ) : null}
      </div>

      <div className="flex min-w-0 items-center gap-1.5 md:hidden">
        {isSignedIn ? (
          <Button asChild variant="ghost" size="sm" className="h-10 px-2">
            <Link href="/bolao/create" aria-label={t("createBolao")}>
              {common("createBolao")}
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" className="h-9 px-3">
            <Link href="/sign-up">{t("getStarted")}</Link>
          </Button>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              aria-label={t("openMenu")}
            >
              <HamburgerMenuIcon className="h-5 w-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent closeLabel={t("closeMenu")}>
            <SheetHeader className="mb-8 pr-12">
              <SheetTitle>{t("menu")}</SheetTitle>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pr-1">
              <nav aria-label={t("primaryNavigation")}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {isSignedIn ? t("yourBolao") : t("explore")}
                </h2>
                <div className="flex flex-col">
                  {(isSignedIn ? memberLinks : visitorMobileLinks).map(
                    (link) => (
                      <NavigationLink
                        key={link.href}
                        link={link}
                        pathname={pathname}
                        mobile
                      />
                    )
                  )}
                </div>
              </nav>

              {isSignedIn ? (
                <nav aria-label={t("moreNavigation")}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t("more")}
                  </h2>
                  <div className="flex flex-col">
                    {mobileSecondaryLinks.map((link) => (
                      <NavigationLink
                        key={link.href}
                        link={link}
                        pathname={pathname}
                        mobile
                      />
                    ))}
                  </div>
                </nav>
              ) : null}

              <MobilePreferences />
            </div>

            {!isSignedIn ? (
              <div className="mt-8 grid gap-3 border-t pt-6">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="h-11">
                    <Link href="/sign-in">{t("login")}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="h-11">
                    <Link href="/sign-up">{t("getStarted")}</Link>
                  </Button>
                </SheetClose>
              </div>
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
      {isSignedIn ? <UserButtonWrapper showName /> : null}
    </div>
  )
}
