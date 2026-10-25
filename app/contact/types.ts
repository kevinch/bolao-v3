export type ContactFormState = {
  status: "idle" | "success" | "error"
  error?: "invalidEmail" | "invalidMessage" | "sendFailed"
}
