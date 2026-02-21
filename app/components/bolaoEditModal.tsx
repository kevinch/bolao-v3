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
import { Input } from "@/components/ui/input"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bolaoName: string
  onNameChange: (bolaoName: string) => void
  onSubmit: () => void
}

export const handlePointerDownOutside = (e: any) => {
  // Prevent closing when clicking inside the dialog
  if (
    e.target instanceof HTMLElement &&
    e.target.closest('[role="dialog"]')
  ) {
    e.preventDefault()
  }
}

export function BolaoEditModal({
  open,
  onOpenChange,
  bolaoName,
  onNameChange,
  onSubmit,
}: SettingsDialogProps) {
  const t = useTranslations("bolaoEditModal")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={handlePointerDownOutside}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="DialogDescription">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="`">
          <Input
            type="text"
            defaultValue={bolaoName}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("cancel")}</Button>
          </DialogClose>
          <Button type="submit" onClick={onSubmit}>
            {t("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
