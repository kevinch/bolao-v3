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
import { Input } from "@/components/ui/input"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bolaoName: string
  onNameChange: (bolaoName: string) => void
  onSubmit: () => void
}

export function BolaoEditModal({
  open,
  onOpenChange,
  bolaoName,
  onNameChange,
  onSubmit,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking inside the dialog
          if (
            e.target instanceof HTMLElement &&
            e.target.closest('[role="dialog"]')
          ) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit bolão</DialogTitle>
          <DialogDescription className="DialogDescription">
            Update your bolão's name
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
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={onSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
