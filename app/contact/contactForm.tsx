"use client"

import { useActionState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitContactMessage } from "./actions"
import type { ContactFormState } from "./types"

const INITIAL_STATE: ContactFormState = { status: "idle" }

export default function ContactForm() {
  const t = useTranslations("contact")
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    submitContactMessage,
    INITIAL_STATE
  )

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset()
  }, [state.status])

  const errorMessage =
    state.status === "error"
      ? t(state.error === "invalidEmail" ? "invalidEmail" : state.error === "invalidMessage" ? "invalidMessage" : "error")
      : null

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contact-email">{t("emailLabel")}</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={320}
          placeholder={t("emailPlaceholder")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">{t("messageLabel")}</Label>
        <textarea
          id="contact-message"
          name="message"
          className="flex min-h-40 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          maxLength={3000}
          placeholder={t("messagePlaceholder")}
          required
        />
      </div>

      <div className="absolute -left-[10000px]" aria-hidden="true">
        <Label htmlFor="contact-website">{t("honeypotLabel")}</Label>
        <Input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status === "success" && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          {t("success")}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("sending") : t("submit")}
      </Button>
    </form>
  )
}
