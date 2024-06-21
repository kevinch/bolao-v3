"use client"

import { STYLES_BOX_SHADOW } from "@/app/lib/utils"
import clsx from "clsx"
import { buttonClasses } from "@/app/ui/styles"
import { Bolao } from "@/app/lib/definitions"
import { deleteBolaoGroup } from "../lib/controllerAdmin"
import { formatDateNews } from "@/app/lib/utils"
import { useState } from "react"

function AdminBolao({ bolao }: { bolao: Bolao }) {
  const [finalBtns, setFinalBtns] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const actionDelete = async (bolaoId: string) => {
    try {
      const result = await deleteBolaoGroup(bolaoId)

      if (result.success) {
        setDeleted(true)
      }
      // TODO:
      // handle error
    } catch (error) {
      console.error("Error deleting bolao:", error)
    }
  }

  const formatedDate = formatDateNews(bolao.created_at.toString())

  return (
    <div key={bolao.id} className={STYLES_BOX_SHADOW}>
      <h3 className="text-1xl capitalize mb-4">{bolao.name}</h3>

      <div className="flex justify-between">
        <div className="space-x-4">
          <span>Comp id: {bolao.competition_id}</span>
          <span>{"-"}</span>
          <span>Id: ****{bolao.id.slice(-5)}</span>
          <span>{"-"}</span>
          <span>by: ****{bolao.created_by.slice(-5)}</span>
          <span>on: {formatedDate}</span>
        </div>

        <div>
          {deleted ? (
            <span className={clsx("text-green-500")}>Deleted</span>
          ) : finalBtns ? (
            <>
              <button
                className={clsx(
                  buttonClasses,
                  "bg-white border-green-500 text-green-500"
                )}
                onClick={() => setFinalBtns(false)}
              >
                cancel
              </button>
              &nbsp;
              <button
                className={clsx(
                  buttonClasses,
                  "bg-white border-red-500 text-red-500"
                )}
                onClick={() => actionDelete(bolao.id)}
              >
                confirm
              </button>
            </>
          ) : (
            <button
              onClick={() => setFinalBtns(true)}
              className={clsx(
                buttonClasses,
                "bg-white border-red-500 text-red-500"
              )}
            >
              delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminBolao
