import { describe, expect, it } from "vitest"
import {
  SITE_DESCRIPTION,
  SITE_DESCRIPTIONS,
  getSiteDescription,
} from "../siteConfig"

describe("siteConfig", () => {
  it("provides localized site descriptions", () => {
    expect(getSiteDescription("en")).toBe(SITE_DESCRIPTIONS.en)
    expect(getSiteDescription("pt-br")).toBe(SITE_DESCRIPTIONS["pt-br"])
  })

  it("falls back to English for an unsupported locale", () => {
    expect(getSiteDescription("fr")).toBe(SITE_DESCRIPTION)
  })
})
