import { exitPreview } from "@prismicio/next"
import { applyNoStoreHeaders } from "../cacheHeaders"

export async function GET() {
  return await applyNoStoreHeaders(exitPreview())
}
