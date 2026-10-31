// @ts-check
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const allowedDevOrigins = process.env.DEV_HOST
  ? [process.env.DEV_HOST]
  : []

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  allowedDevOrigins,
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
}

export default withNextIntl(nextConfig)
