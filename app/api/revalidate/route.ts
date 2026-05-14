import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

type RevalidateRequestBody = {
  secret?: string
  tags?: string[]
  paths?: string[]
}

const DEFAULT_TAGS = ["prismic"]

function expireTag(tag: string) {
  revalidateTag(tag, { expire: 0 })
}

function normalizeStringArray(values?: string[]) {
  if (!values) {
    return []
  }

  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

async function parseBody(request: Request): Promise<RevalidateRequestBody> {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

export async function POST(request: Request) {
  const body = await parseBody(request)
  const expectedSecret = process.env.REVALIDATE_SECRET

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured." },
      { status: 500 }
    )
  }

  const providedSecret =
    request.headers.get("x-revalidate-secret") || body.secret || ""

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const tags = normalizeStringArray(body.tags)
  const paths = normalizeStringArray(body.paths)
  const tagsToRevalidate = tags.length > 0 ? tags : DEFAULT_TAGS

  tagsToRevalidate.forEach(expireTag)
  paths.forEach((path) => revalidatePath(path))

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    tags: tagsToRevalidate,
    paths,
  })
}
