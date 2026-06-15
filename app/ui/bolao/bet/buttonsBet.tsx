"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations } from "next-intl"
import { createBet, updateBet } from "@/app/lib/actions"
import { INITIAL_BET_VALUE } from "@/app/lib/utils"
import { BetResult } from "@/app/lib/definitions"
import { useToast } from "@/hooks/use-toast"
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

function displayToSavedValue(display: string): number | null {
  if (display === INITIAL_BET_VALUE) return null
  return Number(display)
}

function savedValueToDisplay(saved: number | null): string {
  return saved === null ? INITIAL_BET_VALUE : String(saved)
}

function isBetSaveSuccess(
  result: BetResult
): result is Extract<BetResult, { id: string }> {
  return "id" in result && typeof result.id === "string"
}

function ButtonsBet({
  userBolaoId,
  type,
  fixtureId,
  betValue,
  betId,
  disabled,
}: Props) {
  const t = useTranslations("betPage")
  const { toast } = useToast()
  const initialSaved = betValue !== undefined ? betValue : null
  const [value, setValue] = useState(savedValueToDisplay(initialSaved))
  const [betIdValue, setBetIdValue] = useState(betId || null)

  const valueRef = useRef(value)
  const betIdRef = useRef(betId || null)
  const savedValueRef = useRef<number | null>(initialSaved)
  const isSavingRef = useRef(false)
  const pendingSaveRef = useRef(false)

  valueRef.current = value
  betIdRef.current = betIdValue

  useEffect(() => {
    const saved = betValue !== undefined ? betValue : null
    savedValueRef.current = saved
    betIdRef.current = betId || null
    setValue(savedValueToDisplay(saved))
    setBetIdValue(betId || null)
  }, [betValue, betId])

  const showSaveError = useCallback(
    (message?: string) => {
      const isLocked = message === "Betting is locked for this fixture."
      toast({
        variant: "destructive",
        title: t("saveErrorTitle"),
        description: isLocked
          ? t("saveLockedDescription")
          : message || t("saveErrorDescription"),
      })
    },
    [t, toast]
  )

  const persistBetRef = useRef<() => Promise<boolean>>(async () => true)

  persistBetRef.current = async () => {
    const numValue = displayToSavedValue(valueRef.current)
    if (numValue === null) return true
    if (numValue === savedValueRef.current) return true

    if (isSavingRef.current) {
      pendingSaveRef.current = true
      return false
    }

    isSavingRef.current = true
    pendingSaveRef.current = false
    let savedSuccessfully = false

    try {
      let result: BetResult

      if (betIdRef.current) {
        result = await updateBet({ betId: betIdRef.current, value: numValue })
      } else {
        result = await createBet({
          userBolaoId,
          value: numValue,
          type,
          fixtureId,
        })
      }

      if (isBetSaveSuccess(result)) {
        savedValueRef.current = numValue
        betIdRef.current = result.id
        setBetIdValue(result.id)
        savedSuccessfully = true
        return true
      }

      showSaveError("message" in result ? result.message : undefined)
      setValue(savedValueToDisplay(savedValueRef.current))
      return false
    } catch (error) {
      console.error("Error creating/updating bet:", error)
      showSaveError()
      setValue(savedValueToDisplay(savedValueRef.current))
      return false
    } finally {
      isSavingRef.current = false

      if (!savedSuccessfully) {
        pendingSaveRef.current = false
        return
      }

      const currentValue = displayToSavedValue(valueRef.current)
      const needsFollowUpSave =
        pendingSaveRef.current ||
        (currentValue !== null && currentValue !== savedValueRef.current)

      pendingSaveRef.current = false

      if (needsFollowUpSave) {
        void persistBetRef.current()
      }
    }
  }

  useEffect(() => {
    if (value === INITIAL_BET_VALUE) return

    const timer = setTimeout(() => {
      void persistBetRef.current()
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  useEffect(() => {
    return () => {
      const pendingValue = displayToSavedValue(valueRef.current)
      if (pendingValue !== null && pendingValue !== savedValueRef.current) {
        void persistBetRef.current()
      }
    }
  }, [])

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
