import Link from "next/link"
import { getTranslations } from "next-intl/server"
import PageTitle from "@/app/components/pageTitle"

const pClasses = "mb-10"
const h2Classes = "text-2xl mb-6 text-center"
const linkClasses = "underline hover:no-underline"

export default async function About() {
  const t = await getTranslations("about")

  return (
    <div>
      <PageTitle center={true}>
        <h1>{t("title")}</h1>
      </PageTitle>

      <h2 className={h2Classes}>{t("bolaoTitle")}</h2>
      <p className={pClasses}>
        {t("bolaoDesc1")}{" "}
        <Link
          className={linkClasses}
          href="https://en.wiktionary.org/wiki/bol%C3%A3o"
        >
          {t("wikiPage")}
        </Link>
        .
      </p>

      <p className={pClasses}>{t("bolaoDesc2")}</p>

      <p className={pClasses}>{t("bolaoDesc3")}</p>

      <h2 className={h2Classes}>{t("whoTitle")}</h2>
      <p className={pClasses}>
        {t("whoDesc")}{" "}
        <Link
          className={linkClasses}
          href="https://www.linkedin.com/in/kevinchevallier/"
          target="_blank"
        >
          LinkedIn
        </Link>
        .
      </p>

      <h2 className={h2Classes}>{t("techTitle")}</h2>

      <p className={pClasses}>{t("techDesc1")}</p>

      <p className={pClasses}>{t("techDesc2")}</p>

      <h2 className={h2Classes}>{t("coverageTitle")}</h2>
      <p className={pClasses}>
        {t.rich("coverageDesc", {
          apiLink: (chunks) => (
            <Link
              href="https://api-sports.io/sports/football"
              className={linkClasses}
              target="_blank"
            >
              {chunks}
            </Link>
          ),
          linkedinLink: (chunks) => (
            <Link
              className={linkClasses}
              href="https://www.linkedin.com/in/kevinchevallier/"
              target="_blank"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  )
}
