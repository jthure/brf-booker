"use server"

import { addBooking, removeBooking } from "@/lib/booking-service"
import type { BookingResult } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function createBooking(bookingData: {
  date: string
  startTime: string
  endTime: string
  userId: string
}): Promise<BookingResult> {
  console.log("createBooking", bookingData)
  try {
    // Add validation here if needed
    if (!bookingData.date || !bookingData.startTime || !bookingData.endTime || !bookingData.userId) {
      return {
        success: false,
        error: "Missing required booking information",
      }
    }

    const booking = await addBooking(bookingData)

    // Revalidate the home page to reflect the new booking
    revalidatePath("/")

    return {
      success: true,
      booking,
    }
  } catch (error) {
    console.error("Error creating booking:", error, (error as any)?.stack)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create booking",
    }
  }
}

export async function cancelBooking(bookingId: string): Promise<BookingResult> {
  try {
    // Add validation here if needed
    if (!bookingId) {
      return {
        success: false,
        error: "Booking ID is required",
      }
    }

    const success = await removeBooking(bookingId)

    if (!success) {
      return {
        success: false,
        error: "Booking not found or could not be cancelled",
      }
    }

    // Revalidate the home page to reflect the cancelled booking
    revalidatePath("/")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel booking",
    }
  }
}
