import { createClient } from "@/prismicio"
import Link from "next/link"

async function News() {
  const client = createClient()
  const documents = await client.getAllByType("news")

  console.log({ documents })

  return (
    <div>
      <h1>News</h1>
      <div>
        {documents.map((document) => (
          <div>
            <pre>{JSON.stringify(document, null, 2)}</pre>

            <h2>
              <Link href={`/news/${document.uid}`}>
                {document.data.title[0]?.text}
              </Link>
            </h2>
          </div>
        ))}
      </div>
    </div>
  )
}

export default News
