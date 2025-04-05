"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onNameChange: (name: string) => void
  onSubmit: () => void
}

export function BolaoEditModal({
  open,
  onOpenChange,
  name,
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
            defaultValue={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
