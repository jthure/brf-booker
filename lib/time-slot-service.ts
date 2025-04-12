export interface DayTimeSettings {
  enabled: boolean
  startTime: string
  endTime: string
}

export interface TimeSlotSettings {
  [day: string]: DayTimeSettings
}

// Mock data for time slot settings
let mockTimeSlotSettings: TimeSlotSettings = {
  Monday: { enabled: true, startTime: "07:00", endTime: "22:00" },
  Tuesday: { enabled: true, startTime: "07:00", endTime: "22:00" },
  Wednesday: { enabled: true, startTime: "07:00", endTime: "22:00" },
  Thursday: { enabled: true, startTime: "07:00", endTime: "22:00" },
  Friday: { enabled: true, startTime: "07:00", endTime: "22:00" },
  Saturday: { enabled: true, startTime: "07:00", endTime: "22:00" },
  Sunday: { enabled: true, startTime: "07:00", endTime: "22:00" },
}

export async function getTimeSlotSettings(): Promise<TimeSlotSettings> {
  // In a real app, this would fetch from a database
  return { ...mockTimeSlotSettings }
}

export async function updateTimeSlotSettings(settings: TimeSlotSettings): Promise<boolean> {
  try {
    // Validate settings
    for (const day in settings) {
      const daySettings = settings[day]

      // Ensure start time is before end time
      if (daySettings.startTime >= daySettings.endTime) {
        throw new Error(`${day}: Start time must be before end time`)
      }
    }

    // Update settings
    mockTimeSlotSettings = { ...settings }
    return true
  } catch (error) {
    console.error("Error updating time slot settings:", error)
    throw error
  }
}

export function generateTimeSlots(daySettings: DayTimeSettings): { start: string; end: string }[] {
  if (!daySettings.enabled) {
    return []
  }

  const slots: { start: string; end: string }[] = []

  let currentTime = daySettings.startTime
  const endTime = daySettings.endTime

  // Generate 3-hour slots
  while (currentTime < endTime) {
    // Parse current time
    const [hours, minutes] = currentTime.split(":").map(Number)

    // Calculate end time (3 hours later)
    const endHour = hours + 3
    const endMinutes = minutes

    // Format end time
    const formattedEndTime = `${String(endHour).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`

    // If end time is beyond the day's end time, use the day's end time
    if (formattedEndTime > endTime) {
      slots.push({ start: currentTime, end: endTime })
      break
    }

    slots.push({ start: currentTime, end: formattedEndTime })

    // Move to next time slot
    currentTime = formattedEndTime
  }

  return slots
}

