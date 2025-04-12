"use server"

import { updateTimeSlotSettings } from "@/lib/time-slot-service"
import { revalidatePath } from "next/cache"
import type { TimeSlotSettings } from "@/lib/time-slot-service"

export async function updateTimeSettings(settings: TimeSlotSettings): Promise<{ success: boolean; error?: string }> {
  try {
    await updateTimeSlotSettings(settings)

    // Revalidate both admin and home pages
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error updating time settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update time settings",
    }
  }
}

