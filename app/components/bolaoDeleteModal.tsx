"use client"

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
  if (
    e.target instanceof HTMLElement &&
    e.target.closest('[role="dialog"]')
  ) {
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={handlePointerDownOutside}>
        <DialogHeader>
          <DialogTitle>Delete bolão</DialogTitle>
          <DialogDescription className="DialogDescription">
            Are you sure you want to delete this bolão? This action cannot be
            undone. Bets will be deleted as well.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            disabled={disabledDelete}
            variant="destructive"
            onClick={() => onSubmit(bolaoId)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
