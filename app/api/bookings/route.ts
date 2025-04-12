import { getWeeklyBookings } from "@/lib/booking-service"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDateParam = searchParams.get("startDate")

    if (!startDateParam) {
      return NextResponse.json({ error: "startDate parameter is required" }, { status: 400 })
    }

    const startDate = new Date(startDateParam)
    const bookings = await getWeeklyBookings(startDate)

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

