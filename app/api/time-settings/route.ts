import { getTimeSlotSettings } from "@/lib/time-slot-service"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const settings = await getTimeSlotSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching time settings:", error)
    return NextResponse.json({ error: "Failed to fetch time settings" }, { status: 500 })
  }
}

