"use client"

import { ReactNode, useState, forwardRef } from "react"
import Link from "next/link"
import { format } from "date-fns"
import CopyToClipboard from "./copyToClipboard"
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
import BolaoYearBadge from "@/app/components/bolaoYearBadge"
import { useToast } from "@/hooks/use-toast"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function BolaoCard({ bolao, userId }: { bolao: Bolao; userId: string }) {
  const [name, setName] = useState(bolao.name)
  const [disabledDelete, setDisabledDelete] = useState(false)
  const { toast } = useToast()

  let bolaoDate = bolao.year.toString()

  if (bolao.start && bolao.end) {
    const startYear = new Date(bolao.start).getFullYear()
    const endYear = new Date(bolao.end).getFullYear()

    if (startYear < endYear) {
      bolaoDate = `${format(bolao.start, "yyyy", {})}/${format(bolao.end, "yyyy", {})}`
    }
  }

  async function handleUpdateBolao() {
    const data = { name, bolaoId: bolao.id }

    const result = await updateBolao(data)

    if (result.success) {
      toast({
        title: "Success",
        description: "The bolão was successfully updated.",
        variant: "success",
      })
    } else {
      toast({
        description: "There was an issue with the update.",
        variant: "destructive",
      })
    }
  }

  async function actionDelete(bolaoId: string) {
    const result = await deleteBolaoGroup(bolaoId)

    if (result.success) {
      setDisabledDelete(true)
      toast({
        title: "Success",
        description: "The bolão was successfully deleted.",
        variant: "success",
      })
    } else {
      toast({
        description: "There was an issue with the creation.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {bolao.name}&nbsp;
          <BolaoYearBadge bolao={bolao} />
        </CardTitle>
      </CardHeader>

      <CardFooter>
        <div className="flex justify-between w-full">
          <div className="space-x-2">
            <Button asChild variant="outline">
              <Link href={`/bolao/${bolao.id}/bet`}>Bet</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/bolao/${bolao.id}/results`}>Results</Link>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
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
      </CardFooter>
    </Card>
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
