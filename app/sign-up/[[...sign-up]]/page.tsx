"use client"

import { SignUp, useSignUp } from "@clerk/nextjs"
import PageTitle from "@/app/components/pageTitle"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"

function SignUpWrapper() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectUrl = searchParams.get("redirect_url")

  useEffect(() => {
    if (isLoaded && signUp?.status === "complete") {
      setActive({ session: signUp.createdSessionId })
        .then(() => {
          router.push(redirectUrl || "/")
        })
        .catch((error) => {
          console.error("Error setting active session", error)
          router.push("/")
        })
    }
  }, [isLoaded, signUp, setActive, router, redirectUrl])

  return <SignUp routing="path" path="/sign-up" />
}

export default function Page() {
  return (
    <main>
      <PageTitle>Register</PageTitle>

      <div className="flex justify-center">
        <SignUpWrapper />
      </div>
    </main>
  )
}
