import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Server-side signing for bolão invite links.
 *
 * An invite URL carries a token = HMAC-SHA256(secret, bolaoId). Because the
 * secret never leaves the server, a token cannot be forged from the bolão id
 * alone, which is what closes the "anyone who knows the id can self-join" hole.
 *
 * The secret is INVITE_LINK_SECRET when set, otherwise CLERK_SECRET_KEY (always
 * present in this app), so invites work with no extra configuration. Rotating
 * either value invalidates previously shared links.
 */
function getSigningSecret(): string {
  const secret = process.env.INVITE_LINK_SECRET || process.env.CLERK_SECRET_KEY

  if (!secret) {
    throw new Error(
      "Invite signing secret missing: set INVITE_LINK_SECRET or CLERK_SECRET_KEY."
    )
  }

  return secret
}

export function signInvite(bolaoId: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(`bolao-invite:${bolaoId}`)
    .digest("base64url")
}

export function verifyInvite(
  bolaoId: string,
  token: string | undefined | null
): boolean {
  if (!token) {
    return false
  }

  let expected: string
  try {
    expected = signInvite(bolaoId)
  } catch {
    return false
  }

  const provided = Buffer.from(token)
  const expectedBuffer = Buffer.from(expected)

  if (provided.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(provided, expectedBuffer)
}
