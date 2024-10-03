"use client"

import { formatDateNews } from "@/app/lib/utils"
import { PrismicRichText } from "@prismicio/react"
import type { NewsDocument } from "@/prismicio-types"

function NewsList({ documents }: { documents: NewsDocument[] }) {
  return (
    <>
      {documents.map((document: any) => {
        return (
          <div className="mb-20" key={document.id}>
            <h2 className="text-2xl">{document.data.title[0]?.text}</h2>
            <div className="text-sm mb-12 text-slate-500">
              {formatDateNews(document.first_publication_date)}
            </div>

            <PrismicRichText field={document.data.content} />
          </div>
        )
      })}
    </>
  )
}

export default NewsList
