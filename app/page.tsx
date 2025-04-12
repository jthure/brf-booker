import { BookingCalendar } from "@/components/booking-calendar"
import { UserNav } from "@/components/user-nav"
import { getWeeklyBookings } from "@/lib/booking-service"
import { startOfWeek, addDays } from "date-fns"
import { cookies } from "next/headers"
import { getUserById } from "@/lib/user-service"

export default async function Home() {
  // Check if user is authenticated
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")

  let user = null

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value)
      user = await getUserById(session.userId)
    } catch (error) {
      console.error("Session parsing error:", error)
    }
  }

  // Get the current week's Monday
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })

  // Generate the week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  // Fetch bookings for the current week
  const bookings = await getWeeklyBookings(monday)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-xl font-bold">BRF Laundry Room Booking</h1>
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <BookingCalendar initialBookings={bookings} initialWeekDates={weekDates.map((date) => date.toISOString())} />
      </main>
    </div>
  )
}
