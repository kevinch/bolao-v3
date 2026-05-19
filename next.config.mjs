// @ts-check
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, s-maxage=300, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/pt-br",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, s-maxage=300, stale-while-revalidate=86400",
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
