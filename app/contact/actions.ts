"use server"

import { Resend } from "resend"
import type { ContactFormState } from "./types"

const CONTACT_EMAIL = "hibolaoio@gmail.com"
const MAX_MESSAGE_LENGTH = 3000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitContactMessage(
  _previousState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Silently accept bot submissions caught by the hidden honeypot field.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success" }
  }

  const email = String(formData.get("email") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()

  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return { status: "error", error: "invalidEmail" }
  }

  if (message.length < 5 || message.length > MAX_MESSAGE_LENGTH) {
    return { status: "error", error: "invalidMessage" }
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !from) {
    console.error("Contact form is missing Resend configuration.")
    return { status: "error", error: "sendFailed" }
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: "Bolão.io website feedback",
      text: `From: ${email}\n\n${message}`,
    })

    if (error) {
      console.error("Contact form email failed:", error)
      return { status: "error", error: "sendFailed" }
    }

    return { status: "success" }
  } catch (error) {
    console.error("Contact form email failed:", error)
    return { status: "error", error: "sendFailed" }
  }
}
