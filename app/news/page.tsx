import { createClient } from "@/prismicio"
import { PrismicRichText } from "@prismicio/react"
import PageTitle from "../components/pageTitle"
import { formatDateNews } from "../lib/utils"

async function News() {
  const client = createClient()
  const documents = await client.getAllByType("news")

  // console.log(documents[0].data)

  return (
    <div>
      <PageTitle center={true}>News</PageTitle>

      <div>
        {documents.map((document) => {
          return (
            <div className="mb-6">
              <h2 className="text-2xl">
                {/* <Link href={`/news/${document.uid}`}> */}
                {document.data.title[0]?.text}
                {/* </Link> */}
              </h2>
              <p className="text-sm mb-10 text-slate-500">
                {formatDateNews(document.first_publication_date)}
              </p>

              <PrismicRichText field={document.data.content} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default News
