import { createClient } from "@/prismicio"

async function NewsPost(props: any) {
  const params = await props.params;
  const client = createClient()
  const document = await client.getByUID("news", params.uid)

  // console.log({ document })

  return (
    <div>
      <pre>{JSON.stringify(document, null, 2)}</pre>

      {/* <h1>{document.data.title[0]?.text}</h1>
      <div>{document.data.content[0]?.text}</div> */}
    </div>
  )
}

export default NewsPost
