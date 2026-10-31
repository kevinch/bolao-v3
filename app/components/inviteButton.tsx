"use client"

import { useTranslations } from "next-intl"
import { Share1Icon } from "@radix-ui/react-icons"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { copyText } from "@/app/lib/copyText"

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

  function getInviteUrl() {
    return new URL(`/bolao/${bolaoId}/invite`, window.location.href).toString()
  }

  async function copyInviteLink() {
    try {
      await copyText(getInviteUrl())
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
    const inviteUrl = getInviteUrl()
    const shareText = t("shareMessage", { name: bolaoName })

    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isMobileDevice && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: bolaoName,
          text: `${shareText} ${inviteUrl}`,
          url: inviteUrl,
        })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
      }
    }

    await copyInviteLink()
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleInvite}
      aria-label={iconOnly ? t("button") : props["aria-label"]}
      title={iconOnly ? t("button") : undefined}
      {...props}
    >
      <Share1Icon
        className={iconOnly ? "h-4 w-4" : "mr-1.5 h-4 w-4"}
        aria-hidden="true"
      />
      {!iconOnly && t("button")}
    </Button>
  )
}
