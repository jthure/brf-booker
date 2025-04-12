import { db } from "./db"
import { endOfDay, startOfDay } from "date-fns"

// Server-side function to get weekly bookings
export async function getWeeklyBookings(startDate: Date) {
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 7)

  return db.booking.findMany({
    where: {
      date: {
        gte: startOfDay(startDate),
        lt: endOfDay(endDate),
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      date: 'asc',
    },
  })
}

// This function is used by the server action
export async function addBooking(bookingData: {
  date: string
  startTime: string
  endTime: string
  userId: string
}) {
  // Check if the slot is already booked
  const existingBooking = await db.booking.findFirst({
    where: {
      date: new Date(bookingData.date),
      startTime: bookingData.startTime,
    },
  })

  if (existingBooking) {
    throw new Error("This time slot is already booked")
  }
  console.log("result", {
    date: new Date(bookingData.date),
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
    userId: bookingData.userId,
  });

  const result = await db.booking.create({
    data: {
      date: new Date(bookingData.date),
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      userId: bookingData.userId,
    },
    include: {
      user: true,
    },
  })

  console.log("result", result)
  return result
}

// This function is used by the server action to remove a booking
export async function removeBooking(bookingId: string): Promise<boolean> {
  try {
    await db.booking.delete({
      where: {
        id: bookingId,
      },
    })
    return true
  } catch (error) {
    console.error("Error removing booking:", error)
    return false
  }
}
