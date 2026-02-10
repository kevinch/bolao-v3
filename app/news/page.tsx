import { createClient } from "@/prismicio"
import PageTitle from "../components/pageTitle"
import NewsList from "../ui/news/newsList"

async function News() {
  const client = createClient()
  const documents = await client.getAllByType("news", {
    orderings: [
      { field: "document.first_publication_date", direction: "desc" },
    ],
  })

  return (
    <div className="news-container">
      <PageTitle center={true}>
        <h1>News</h1>
      </PageTitle>

      {documents && <NewsList documents={documents} />}
    </div>
  )
}

export default News
