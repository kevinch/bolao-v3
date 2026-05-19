export async function applyNoStoreHeaders(
  responseOrPromise: Response | Promise<Response>
) {
  const response = await responseOrPromise

  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  response.headers.set("CDN-Cache-Control", "no-store")
  response.headers.set("Vercel-CDN-Cache-Control", "no-store")

  return response
}
