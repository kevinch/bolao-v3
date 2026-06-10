"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { asText } from "@prismicio/client"
import { formatDateNews } from "@/app/lib/utils"
import type { NewsDocument } from "@/prismicio-types"

const EXCERPT_LENGTH = 240

function excerpt(document: NewsDocument): string {
  const text = asText(document.data.content)
  return text.length > EXCERPT_LENGTH
    ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…`
    : text
}

function NewsList({ documents }: { documents: NewsDocument[] }) {
  const t = useTranslations("common")

  return (
    <>
      {documents.map((document) => (
        <article className="mb-20" key={document.id}>
          <h2 className="text-2xl">
            <Link href={`/news/${document.uid}`} className="hover:underline">
              {asText(document.data.title)}
            </Link>
          </h2>
          <div className="text-sm mb-6 text-slate-500">
            {formatDateNews(document.first_publication_date)}
          </div>

          <p className="mb-4">{excerpt(document)}</p>

          <Link
            href={`/news/${document.uid}`}
            className="underline hover:no-underline"
          >
            {t("readMore")}
          </Link>
        </article>
      ))}
    </>
  )
}

export default NewsList
