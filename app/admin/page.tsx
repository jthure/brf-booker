import { AdminTimeSlotSettings } from "@/components/admin-time-slot-settings"
import { getTimeSlotSettings } from "@/lib/time-slot-service"

export default async function AdminPage() {
  // Fetch the current time slot settings
  const timeSlotSettings = await getTimeSlotSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-xl font-bold">BRF Laundry Room Admin</h1>
          <div className="ml-auto">
            <a href="/" className="text-sm text-blue-600 hover:underline">
              Back to Booking
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Admin Settings</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Time Slot Settings</h3>
              <p className="mb-4 text-sm text-gray-600">
                Configure the available time slots for each day of the week. The system will generate 3-hour time slots
                between the start and end times.
              </p>
              <AdminTimeSlotSettings initialSettings={timeSlotSettings} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

