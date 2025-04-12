import { Booking } from "./db"

export interface TimeSlotData {
  date: string
  startTime: string
  endTime: string
}


export interface BookingResult {
  success: boolean
  booking?: Booking
  error?: string
}

export type { Booking, User } from "./db"
