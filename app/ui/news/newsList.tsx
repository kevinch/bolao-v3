"use client"

import { formatDateNews } from "@/app/lib/utils"
import { PrismicRichText } from "@prismicio/react"

function NewsList({
  documents,
}: {
  documents: any
  // [
  //   {
  //     id: string
  //     uid: string
  //     url: string
  //     type: string
  //     href: string
  //     tags: []
  //     first_publication_date: string
  //     last_publication_date: string
  //     slugs: []
  //     linked_documents: []
  //     lang: string
  //     alternate_languages: []
  //     data: any
  // {
  //   title: [
  //     {
  //       type: string
  //       text: string
  //       spans: []
  //       direction: string
  //     },
  //   ],
  //   content: [
  //     {
  //       type: string
  //       text: string
  //       spans: []
  //       direction: string
  //     }
  //   ]
  // },
  //   },
  // ]
}) {
  return (
    <div>
      {documents.map((document: any) => {
        return (
          <div className="mb-6">
            <h2 className="text-2xl">{document.data.title[0]?.text}</h2>
            <div className="text-sm mb-12 text-slate-500">
              {formatDateNews(document.first_publication_date)}
            </div>

            <PrismicRichText field={document.data.content} />
          </div>
        )
      })}
    </div>
  )
}

export default NewsList
