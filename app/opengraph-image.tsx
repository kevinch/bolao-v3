import { ImageResponse } from "next/og"

export const alt = "Bolão.io — Free soccer betting pools with friends"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 700 }}>Bolão.io</div>
        <div
          style={{
            fontSize: 38,
            marginTop: 24,
            color: "#a1a1aa",
            textAlign: "center",
          }}
        >
          Free soccer betting pools with friends
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
