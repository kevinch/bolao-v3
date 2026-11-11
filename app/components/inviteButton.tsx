"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Share1Icon } from "@radix-ui/react-icons"
import { Button, type ButtonProps } from "@/components/ui/button"
import Spinner from "@/app/components/spinner"
import { useToast } from "@/hooks/use-toast"
import { copyText } from "@/app/lib/copyText"
import { createInviteLink } from "@/app/lib/actions"

type InviteButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  bolaoId: string
  bolaoName: string
  iconOnly?: boolean
}

export default function InviteButton({
  bolaoId,
  bolaoName,
  iconOnly = false,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: InviteButtonProps) {
  const t = useTranslations("invite")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  async function getInviteUrl(): Promise<string | null> {
    const result = await createInviteLink(bolaoId)

    if (!result.success) {
      return null
    }

    const url = new URL(`/bolao/${bolaoId}/invite`, window.location.href)
    url.searchParams.set("t", result.token)
    return url.toString()
  }

  async function copyInviteLink(inviteUrl: string) {
    try {
      await copyText(inviteUrl)
      toast({
        title: t("copySuccessTitle"),
        description: t("copySuccessMessage"),
        variant: "success",
      })
    } catch {
      toast({
        description: t("copyErrorMessage"),
        variant: "destructive",
      })
    }
  }

  async function handleInvite() {
    setIsLoading(true)
    try {
      const inviteUrl = await getInviteUrl()

      if (!inviteUrl) {
        toast({
          description: t("copyErrorMessage"),
          variant: "destructive",
        })
        return
      }

      const shareText = t("shareMessage", { name: bolaoName })

      const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      )

      if (isMobileDevice && typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: bolaoName,
            text: shareText,
            url: inviteUrl,
          })
          return
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return
          }
        }
      }

      await copyInviteLink(inviteUrl)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleInvite}
      disabled={isLoading}
      aria-label={iconOnly ? t("button") : props["aria-label"]}
      title={iconOnly ? t("button") : undefined}
      {...props}
    >
      {isLoading ? (
        <Spinner className={iconOnly ? undefined : "mr-1.5"} />
      ) : (
        <Share1Icon
          className={iconOnly ? "h-4 w-4" : "mr-1.5 h-4 w-4"}
          aria-hidden="true"
        />
      )}
      {!iconOnly && t("button")}
    </Button>
  )
}
