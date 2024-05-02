"use client"

import { useState, useEffect } from "react"
import { createBet, updateBet } from "@/app/lib/actions"
import { initialBetValue } from "@/app/lib/utils"
import { BetResult } from "@/app/lib/definitions"

const classes = "border px-2 mx-2 rounded bg-slate-50"

type Props = {
  userBolaoId: string
  type: "home" | "away"
  fixtureId: string
}

function ButtonsBet({ userBolaoId, type, fixtureId }: Props) {
  const [value, setValue] = useState(initialBetValue)
  const [betId, setBetId] = useState("")

  const setData = async () => {
    try {
      let result: BetResult

      if (betId) {
        const data = { betId, value: Number(value) }
        result = await updateBet(data)
      } else {
        const data = { userBolaoId, value: Number(value), type, fixtureId }
        result = await createBet(data)
      }

      if ("id" in result && !betId) {
        setBetId(result.id)
      }
    } catch (error) {
      console.error("Error creating bet:", error)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (value !== initialBetValue) {
        setData()
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [value])

  const incrementCount = () => {
    if (value === initialBetValue) {
      setValue("0")
    } else {
      setValue((Number(value) + 1).toString())
    }
  }

  const decrementCount = () => {
    if (value !== initialBetValue && Number(value) !== 0) {
      setValue((Number(value) - 1).toString())
    }
  }

  return (
    <div>
      <button className={classes} onClick={() => decrementCount()}>
        -
      </button>
      {value}
      <button className={classes} onClick={() => incrementCount()}>
        +
      </button>
    </div>
  )
}

export default ButtonsBet
