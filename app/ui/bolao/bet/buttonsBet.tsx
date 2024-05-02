"use client"

import { useState, useEffect } from "react"
import { createBet } from "@/app/lib/actions"
import { initialBetValue } from "@/app/lib/utils"

const classes = "border px-2 mx-2 rounded bg-slate-50"

type Props = {
  userBolaoId: string
  type: "home" | "away"
  fixtureId: string
}

function ButtonsBet({ userBolaoId, type, fixtureId }: Props) {
  const [value, setValue] = useState(initialBetValue)

  const setData = async () => {
    try {
      const data = { userBolaoId, value: Number(value), type, fixtureId }
      await createBet(data)
    } catch (error) {
      console.error("Error setting bet:", error)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (value !== initialBetValue) {
        console.log("useEffect called, value:", value)
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
