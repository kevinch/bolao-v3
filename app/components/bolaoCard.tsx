"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
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

import BolaoYearBadge from "@/app/components/bolaoYearBadge"
import { BolaoEditModal } from "@/app/components/bolaoEditModal"
import { BolaoDeleteModal } from "@/app/components/bolaoDeleteModal"
import { useToast } from "@/hooks/use-toast"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function BolaoCard({ bolao, userId }: { bolao: Bolao; userId: string }) {
  const t = useTranslations("bolaoCard")
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

  async function handleUpdate() {
    const data = { name, bolaoId: bolao.id }

    const result = await updateBolao(data)

    if (result.success) {
      toast({
        title: t("updateSuccessTitle"),
        description: t("updateSuccessMessage"),
        variant: "success",
      })
    } else {
      toast({
        description: t("updateErrorMessage"),
        variant: "destructive",
      })
    }
  }

  async function handleDelete(bolaoId: string) {
    const result = await deleteBolaoGroup(bolaoId)

    if (result.success) {
      setDisabledDelete(true)
      toast({
        title: t("deleteSuccessTitle"),
        description: t("deleteSuccessMessage"),
        variant: "success",
      })
    } else {
      toast({
        description: t("deleteErrorMessage"),
        variant: "destructive",
      })
    }
  }

  const [dialogEditOpen, setDialogEditOpen] = useState(false)
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleOpenDialogEdit = () => {
    setDropdownOpen(false) // Close the dropdown first
    setTimeout(() => {
      setDialogEditOpen(true) // Then open the dialog after a small delay
    }, 10)
  }

  const handleOpenDialogDelete = () => {
    setDropdownOpen(false) // Close the dropdown first
    setTimeout(() => {
      setDialogDeleteOpen(true) // Then open the dialog after a small delay
    }, 10)
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
              <Link href={`/bolao/${bolao.id}/bet`}>{t("bet")}</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/bolao/${bolao.id}/results`}>{t("results")}</Link>
            </Button>
          </div>

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <DotsVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <ClipboardCopyIcon className="h-4 w-4 mr-1" />
                  <CopyToClipboard bolaoId={bolao.id} />
                </DropdownMenuItem>

                {bolao.created_by === userId && (
                  <>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        handleOpenDialogEdit()
                      }}
                    >
                      <Pencil2Icon className="h-4 w-4 mr-1" />
                      {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        handleOpenDialogDelete()
                      }}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" color="red" />
                      <span className="text-red-500">{t("delete")}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <BolaoEditModal
            open={dialogEditOpen}
            onOpenChange={setDialogEditOpen}
            bolaoName={bolao.name}
            onNameChange={setName}
            onSubmit={handleUpdate}
          />
          <BolaoDeleteModal
            open={dialogDeleteOpen}
            onOpenChange={setDialogDeleteOpen}
            bolaoId={bolao.id}
            disabledDelete={disabledDelete}
            onSubmit={handleDelete}
          />
        </div>
      </CardFooter>
    </Card>
  )
}

export default BolaoCard
