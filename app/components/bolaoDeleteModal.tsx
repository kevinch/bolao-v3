"use client"

import { useTranslations } from "next-intl"
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
}: SettingsDialogProps) {
  const t = useTranslations("bolaoDeleteModal")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={handlePointerDownOutside}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="DialogDescription">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("cancel")}</Button>
          </DialogClose>
          <Button
            disabled={disabledDelete}
            variant="destructive"
            onClick={() => onSubmit(bolaoId)}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
