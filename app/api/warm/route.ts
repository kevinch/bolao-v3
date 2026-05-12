import { NextResponse } from "next/server"

/** Lightweight handler for Vercel Cron keep-warm pings (see vercel.json). */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 })
}
