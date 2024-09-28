"use client"

import { ReactNode, useState, forwardRef } from "react"
import Link from "next/link"
import { format } from "date-fns"
import CopyToClipboard from "./copyToClipboard"
import { STYLES_BOX_SHADOW } from "@/app/lib/utils"
import { updateBolao } from "@/app/lib/actions"
import { deleteBolaoGroup } from "@/app/lib/controllerAdmin"
import { Bolao } from "@/app/lib/definitions"
import { Button } from "@/components/ui/button"
import {
  DotsVerticalIcon,
  Pencil2Icon,
  ClipboardCopyIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

function BolaoCard({ bolao, userId }: { bolao: Bolao; userId: string }) {
  const [name, setName] = useState(bolao.name)
  const [disabledDelete, setDisabledDelete] = useState(false)
  const { toast } = useToast()

  let bolaoDate = bolao.year.toString()

  if (bolao.start && bolao.end) {
    const startYear = new Date(bolao.start).getFullYear()
    const endYear = new Date(bolao.end).getFullYear()

    if (startYear < endYear) {
      bolaoDate = `${format(bolao.start, "yy", {})}/${format(bolao.end, "yy", {})}`
    }
  }

  async function handleUpdateBolao() {
    const data = { name, bolaoId: bolao.id }

    const result = await updateBolao(data)

    if (result.success) {
      toast({
        description: "The bolão was successfully updated.",
      })
    } else {
      toast({
        description: "There was an issue with the update.",
      })
    }
  }

  async function actionDelete(bolaoId: string) {
    const result = await deleteBolaoGroup(bolaoId)

    if (result.success) {
      setDisabledDelete(true)
      toast({
        description: "The bolão was successfully deleted.",
      })
    } else {
      toast({
        description: "There was an issue with the creation.",
      })
    }
  }

  return (
    <div key={bolao.id} className={STYLES_BOX_SHADOW}>
      <h3 className="text-2xl capitalize mb-4">
        {bolao.name}&nbsp;<Badge variant="outline">{bolaoDate}</Badge>
      </h3>

      <div className="flex justify-between">
        <div className="space-x-4">
          <Link
            className="underline hover:no-underline"
            href={`/bolao/${bolao.id}/bet`}
          >
            Bet
          </Link>

          <Link
            className="underline hover:no-underline"
            href={`/bolao/${bolao.id}/results`}
          >
            Results
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <DotsVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <ClipboardCopyIcon className="h-4 w-4 mr-2" />
                <CopyToClipboard bolaoId={bolao.id} />
              </DropdownMenuItem>

              {bolao.created_by === userId && (
                <>
                  <DialogItem
                    triggerChildren={
                      <>
                        <Pencil2Icon className="h-4 w-4 mr-2" /> Edit
                      </>
                    }
                  >
                    <DialogTitle className="DialogTitle">
                      Edit this bolão's name
                    </DialogTitle>
                    <DialogDescription className="DialogDescription">
                      <Input
                        type="text"
                        defaultValue={bolao.name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </DialogDescription>

                    <DialogFooter>
                      <Button onClick={handleUpdateBolao}>Save</Button>
                    </DialogFooter>
                  </DialogItem>

                  <DialogItem
                    triggerChildren={
                      <>
                        <TrashIcon className="h-4 w-4 mr-2" color="red" />
                        <span style={{ color: "red" }}> Delete</span>
                      </>
                    }
                  >
                    <DialogTitle className="DialogTitle">
                      Delete bolão
                    </DialogTitle>
                    <DialogDescription className="DialogDescription">
                      Are you sure you want to delete this bolão? This action
                      cannot be undone. Bets will be deleted as well.
                    </DialogDescription>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button
                        disabled={disabledDelete}
                        variant="destructive"
                        onClick={() => actionDelete(bolao.id)}
                      >
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogItem>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default BolaoCard

interface DialogItemProps {
  triggerChildren: ReactNode
  children: ReactNode
  onSelect?: () => void
  onOpenChange?: () => void
}

const DialogItem = forwardRef<HTMLDivElement, DialogItemProps>(
  (props, forwardedRef) => {
    const { triggerChildren, children, onSelect, onOpenChange, ...itemProps } =
      props

    return (
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <DropdownMenuItem
            {...itemProps}
            ref={forwardedRef}
            className="DropdownMenuItem"
            onSelect={(event) => {
              event.preventDefault()
              onSelect && onSelect()
            }}
          >
            <span style={{ cursor: "pointer", display: "contents" }}>
              {triggerChildren}
            </span>
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay className="DialogOverlay" />
          <DialogContent className="DialogContent">{children}</DialogContent>
        </DialogPortal>
      </Dialog>
    )
  }
)
