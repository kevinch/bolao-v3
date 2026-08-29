import { describe, it, expect, vi, beforeEach } from "vitest"
import { ImageResponse } from "next/og"
import Image, { alt, contentType, size } from "../opengraph-image"

type MockImageResponse = {
  element: unknown
  options: unknown
}

vi.mock("next/og", () => ({
  ImageResponse: class MockImageResponse {
    element: unknown
    options: unknown

    constructor(element: unknown, options: unknown) {
      this.element = element
      this.options = options
    }
  },
}))

describe("opengraph-image", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("exports image metadata", () => {
    expect(alt).toBe("Bolão.io — Free soccer betting pools with friends")
    expect(size).toEqual({ width: 1200, height: 630 })
    expect(contentType).toBe("image/png")
  })

  it("generates an ImageResponse with branding", async () => {
    const result = (await Image()) as unknown as MockImageResponse

    expect(result).toBeInstanceOf(ImageResponse)
    expect(result.options).toEqual({ width: 1200, height: 630 })

    const element = result.element as {
      props: {
        children: Array<{ props: { children: string } }>
      }
    }

    expect(element.props.children[0].props.children).toBe("Bolão.io")
    expect(element.props.children[1].props.children).toBe(
      "Free soccer betting pools with friends"
    )
  })
})
