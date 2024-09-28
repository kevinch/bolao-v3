"use client"

import { STYLES_BOX_SHADOW } from "@/app/lib/utils"
import clsx from "clsx"
import { Bolao } from "@/app/lib/definitions"
import { deleteBolaoGroup } from "../lib/controllerAdmin"
import { formatDateNews } from "@/app/lib/utils"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

function AdminBolao({ bolao }: { bolao: Bolao }) {
  const [deleted, setDeleted] = useState(false)
  const { toast } = useToast()

  const actionDelete = async (bolaoId: string) => {
    const result = await deleteBolaoGroup(bolaoId)

    if (result.success) {
      setDeleted(true)
      toast({
        description: "The bolão was successfully deleted.",
      })
    } else {
      toast({
        description: "There was an issue with the deletion.",
      })
    }
  }

  const formatedDate = formatDateNews(bolao.created_at.toString())

  return (
    <div key={bolao.id} className={STYLES_BOX_SHADOW}>
      <h3 className="text-1xl capitalize mb-4">{bolao.name}</h3>

      <div className="flex justify-between">
        <div className="">
          <div>Competition id: {bolao.competition_id}</div>
          <div>Id: ****{bolao.id.slice(-5)}</div>
          <div>Created by: ****{bolao.created_by.slice(-5)}</div>
          <div>Created at: {formatedDate}</div>
        </div>

        <div>
          {deleted ? (
            <span className={clsx("text-green-500")}>Deleted</span>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">delete</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete bolão</DialogTitle>
                  <DialogDescription>
                    You have selected the bolão "<strong>{bolao.name}</strong>".
                    <br />
                    Once confirmed, this action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => actionDelete(bolao.id)}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminBolao
