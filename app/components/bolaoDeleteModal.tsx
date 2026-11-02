"use client"

import { useTranslations } from "next-intl"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (bolaoId: string) => void
  disabledDelete: boolean
  bolaoId: string
  bolaoName: string
  loading?: boolean
}

export const handlePointerDownOutside = (e: any) => {
  // Prevent closing when clicking inside the dialog
  if (e.target instanceof HTMLElement && e.target.closest('[role="dialog"]')) {
    e.preventDefault()
  }
}

export function BolaoDeleteModal({
  open,
  onOpenChange,
  onSubmit,
  disabledDelete,
  bolaoId,
  bolaoName,
  loading = false,
}: SettingsDialogProps) {
  const t = useTranslations("bolaoDeleteModal")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={handlePointerDownOutside}>
        <DialogHeader>
          <DialogTitle>{t("title", { name: bolaoName })}</DialogTitle>
          <DialogDescription className="DialogDescription">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={loading}>
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            disabled={disabledDelete || loading}
            variant="destructive"
            onClick={() => onSubmit(bolaoId)}
          >
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
