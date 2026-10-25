import { auth } from "@clerk/nextjs/server"
import Script from "next/script"

const PUSHALERT_SCRIPT_URL =
  "https://cdn.pushalert.co/integrate_b0aea8d8062166fd960b713c02407dfc.js"

export default async function PushAlertScript() {
  const testUserId = process.env.PUSHALERT_TEST_USER_ID

  if (!testUserId) {
    return null
  }

  const { userId } = await auth()

  if (userId !== testUserId) {
    return null
  }

  return <Script src={PUSHALERT_SCRIPT_URL} strategy="afterInteractive" />
}
