import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByEmail } from "@/lib/user-service"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // In a real app, you would validate credentials against a database
    // For this demo, we'll use a mock user service
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // In a real app, you would verify the password here
    // For this demo, we'll accept any password

    // Set a session cookie
    const cookieStore = await cookies()
    cookieStore.set("session", JSON.stringify({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
