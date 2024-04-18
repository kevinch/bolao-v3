"use client"

import Link from "next/link"
import { UserButton, useAuth, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function Nav() {
  const { isLoaded, userId } = useAuth()
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <nav>
      <UserButton />
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>

        {isLoaded && userId ? (
          <li>
            <button onClick={() => signOut(() => router.push("/"))}>
              Sign out
            </button>
          </li>
        ) : (
          <>
            <li>
              <Link href="/sign-in">Sign-in</Link>
            </li>
            <li>
              <Link href="/sign-up">Sign-up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}
