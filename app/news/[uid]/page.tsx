import { createClient } from "@/prismicio"

async function NewsPost({ params }: any) {
  const client = createClient()
  const document = await client.getByUID("news", params.uid)

  console.log({ document })

  return (
    <div>
      <pre>{JSON.stringify(document, null, 2)}</pre>

      {/* <h1>{document.data.title[0]?.text}</h1>
      <div>{document.data.content[0]?.text}</div> */}
    </div>
  )
}

export default NewsPost
