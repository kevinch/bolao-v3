"use client"

import { useState, useEffect, useCallback } from "react"
import { createBet, updateBet } from "@/app/lib/actions"
import { INITIAL_BET_VALUE } from "@/app/lib/utils"
import { BetResult } from "@/app/lib/definitions"
import { Button } from "@/components/ui/button"
import { PlusIcon, MinusIcon } from "@radix-ui/react-icons"

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

  const setData = useCallback(async () => {
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
  }, [betIdValue, value, userBolaoId, type, fixtureId])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (value !== INITIAL_BET_VALUE) {
        setData()
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [value, setData])

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

  return (
    <div className="flex items-center">
      <Button
        size="icon"
        variant={disabled ? "ghost" : "outline"}
        disabled={disabled}
        onClick={() => decrementCount()}
      >
        <MinusIcon />
      </Button>
      <div className="mx-2">{value}</div>
      <Button
        size="icon"
        variant={disabled ? "ghost" : "outline"}
        disabled={disabled}
        onClick={() => incrementCount()}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}

export default ButtonsBet
