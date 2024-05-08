"use client"

import { useState, useEffect } from "react"
import { createBet, updateBet } from "@/app/lib/actions"
import { INITIAL_BET_VALUE } from "@/app/lib/utils"
import { BetResult } from "@/app/lib/definitions"
import clsx from "clsx"

type Props = {
  userBolaoId: string
  type: "home" | "away"
  fixtureId: string
  betValue?: number
  betId?: string
  disabled: boolean
}

function ButtonsBet({
  userBolaoId,
  type,
  fixtureId,
  betValue,
  betId,
  disabled,
}: Props) {
  const [value, setValue] = useState(
    betValue !== undefined ? betValue : INITIAL_BET_VALUE
  )
  const [betIdValue, setBetId] = useState(betId || null)

  const setData = async () => {
    try {
      let result: BetResult

      if (betIdValue) {
        const data = { betId: betIdValue, value: Number(value) }
        result = await updateBet(data)
      } else {
        const data = { userBolaoId, value: Number(value), type, fixtureId }
        result = await createBet(data)
      }

      if ("id" in result && !betIdValue) {
        setBetId(result.id)
      }
    } catch (error) {
      console.error("Error creating/updating bet:", error)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (value !== INITIAL_BET_VALUE) {
        setData()
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [value])

  const incrementCount = () => {
    if (value === INITIAL_BET_VALUE) {
      setValue("0")
    } else {
      setValue((Number(value) + 1).toString())
    }
  }

  const decrementCount = () => {
    if (value !== INITIAL_BET_VALUE && Number(value) !== 0) {
      setValue((Number(value) - 1).toString())
    }
  }

  const buttonClasses = clsx("border px-2 mx-2 rounded", {
    "bg-white border-teal-400": !disabled,
    "bg-slate-50 border-slate-100": disabled,
  })

  const labelClasses = clsx("", {
    "text-teal-500": !disabled,
    "text-slate-500": disabled,
  })

  return (
    <div className="content-center">
      <button
        disabled={disabled}
        className={buttonClasses}
        onClick={() => decrementCount()}
      >
        <span className={labelClasses}>-</span>
      </button>
      {value}
      <button
        disabled={disabled}
        className={buttonClasses}
        onClick={() => incrementCount()}
      >
        <span className={labelClasses}>+</span>
      </button>
    </div>
  )
}

export default ButtonsBet
