"use client"

import { useEffect } from "react"
import { createUser, navigate } from "@/app/lib/actions"
import { useUser } from "@clerk/nextjs"

function SaveUserInDb() {
  const { user } = useUser()

  useEffect(() => {
    if (user?.id) {
      createUser({ id: user.id, role: "default" })
      navigate("/")
    }
  }, [user])

  return
}

export default SaveUserInDb
