import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserById } from "@/lib/user-service"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ user: null })
    }

    try {
      const session = JSON.parse(sessionCookie.value)
      const user = await getUserById(session.userId)

      if (!user) {
        return NextResponse.json({ user: null })
      }

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      })
    } catch (error) {
      console.error("Session parsing error:", error)
      return NextResponse.json({ user: null })
    }
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Session check failed" }, { status: 500 })
  }
}
