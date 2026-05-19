import { NextRequest } from "next/server"
import { redirectToPreviewURL } from "@prismicio/next"

import { createClient } from "../../../prismicio"
import { applyNoStoreHeaders } from "../cacheHeaders"

export async function GET(request: NextRequest) {
  const client = createClient()

  const response = await redirectToPreviewURL({ client, request })

  return applyNoStoreHeaders(response)
}
