import { describe, expect, it } from "vitest"
import manifest from "../manifest"
import { SITE_DESCRIPTION, SITE_NAME } from "@/app/lib/siteConfig"

describe("manifest", () => {
  it("defines an installable standalone web app", () => {
    expect(manifest()).toMatchObject({
      id: "/",
      name: SITE_NAME,
      short_name: SITE_NAME,
      description: SITE_DESCRIPTION,
      lang: "en",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#ffffff",
    })
  })

  it("provides standard and maskable install icons", () => {
    expect(manifest().icons).toEqual([
      {
        src: "/icons/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ])
  })
})
