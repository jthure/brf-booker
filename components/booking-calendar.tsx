"use client"

import { useState, useEffect } from "react"
import { addDays, format, isSameDay, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TimeSlot } from "@/components/time-slot"
import { BookingDialog } from "@/components/booking-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { createBooking, cancelBooking } from "@/actions/booking-actions"
import { useRouter } from "next/navigation"
import type { Booking, TimeSlotData } from "@/lib/types"
import { generateTimeSlots } from "@/lib/time-slot-service"
import { useAuth } from "@/context/auth-context"

// Helper function to safely format dates
const safeFormat = (date: string | null | undefined | Date, formatStr: string): string => {
  if (!date) return ""
  try {
    return format(typeof date === "string" ? parseISO(date) : date, formatStr)
  } catch (error) {
    console.error("Date formatting error:", error)
    return ""
  }
}

// Helper function to safely check if two dates are the same day
const safeIsSameDay = (dateA: string | null | undefined | Date, dateB: string | null | undefined | Date): boolean => {
  if (!dateA || !dateB) return false
  try {
    return isSameDay(typeof dateA === "string" ? parseISO(dateA) : dateA, typeof dateB === "string" ? parseISO(dateB) : dateB)
  } catch (error) {
    console.error("Date comparison error:", error)
    return false
  }
}

interface BookingCalendarProps {
  initialBookings: Booking[]
  initialWeekDates: string[]
}

export function BookingCalendar({ initialBookings, initialWeekDates }: BookingCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(initialWeekDates[0])
  const [weekDates, setWeekDates] = useState<string[]>(initialWeekDates)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotData | null>(null)
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const [timeSlotSettings, setTimeSlotSettings] = useState<
    Record<string, { enabled: boolean; startTime: string; endTime: string }>
  >({
    Monday: { enabled: true, startTime: "07:00", endTime: "22:00" },
    Tuesday: { enabled: true, startTime: "07:00", endTime: "22:00" },
    Wednesday: { enabled: true, startTime: "07:00", endTime: "22:00" },
    Thursday: { enabled: true, startTime: "07:00", endTime: "22:00" },
    Friday: { enabled: true, startTime: "07:00", endTime: "22:00" },
    Saturday: { enabled: true, startTime: "07:00", endTime: "22:00" },
    Sunday: { enabled: true, startTime: "07:00", endTime: "22:00" },
  })

  useEffect(() => {
    const fetchTimeSlotSettings = async () => {
      try {
        const response = await fetch("/api/time-settings")
        if (response.ok) {
          const settings = await response.json()
          setTimeSlotSettings(settings)
        }
      } catch (error) {
        console.error("Error fetching time slot settings:", error)
      }
    }

    fetchTimeSlotSettings()
  }, [])

  const getTimeSlotsForDay = (date: string) => {
    try {
      const dateObj = parseISO(date)
      const dayName = format(dateObj, "EEEE") as keyof typeof timeSlotSettings
      return generateTimeSlots(timeSlotSettings[dayName] || { enabled: true, startTime: "07:00", endTime: "22:00" })
    } catch (error) {
      console.error("Error getting time slots for day:", error)
      return []
    }
  }

  const handlePreviousWeek = async () => {
    try {
      setIsLoading(true)
      const currentDate = parseISO(currentWeekStart)
      const newStartDate = addDays(currentDate, -7)
      const newStartDateStr = newStartDate.toISOString()

      // Generate new week dates
      const newWeekDates = Array.from({ length: 7 }, (_, i) => addDays(newStartDate, i).toISOString())

      setCurrentWeekStart(newStartDateStr)
      setWeekDates(newWeekDates)

      // Fetch new bookings for the week
      const response = await fetch(`/api/bookings?startDate=${newStartDateStr}`)
      if (response.ok) {
        const newBookings = await response.json()
        setBookings(newBookings)
      }
    } catch (error) {
      console.error("Error navigating to previous week:", error)
      toast({
        title: "Error",
        description: "Failed to load previous week. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextWeek = async () => {
    try {
      setIsLoading(true)
      const currentDate = parseISO(currentWeekStart)
      const newStartDate = addDays(currentDate, 7)
      const newStartDateStr = newStartDate.toISOString()

      // Generate new week dates
      const newWeekDates = Array.from({ length: 7 }, (_, i) => addDays(newStartDate, i).toISOString())

      setCurrentWeekStart(newStartDateStr)
      setWeekDates(newWeekDates)

      // Fetch new bookings for the week
      const response = await fetch(`/api/bookings?startDate=${newStartDateStr}`)
      if (response.ok) {
        const newBookings = await response.json()
        setBookings(newBookings)
      }
    } catch (error) {
      console.error("Error navigating to next week:", error)
      toast({
        title: "Error",
        description: "Failed to load next week. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSlotClick = (date: string, timeSlot: { start: string; end: string }) => {
    try {
      // Check if the slot is already booked
      const existingBooking = bookings.find(
        (booking) => safeIsSameDay(booking.date, date) && booking.startTime === timeSlot.start,
      )

      if (existingBooking) {
        // If the current user is the booker, show delete confirmation
        if (user && existingBooking.userId === user.id) {
          setBookingToDelete(existingBooking)
          setIsDeleteDialogOpen(true)
        }
        // Otherwise, do nothing (slot is already booked by someone else)
        return
      }

      // If slot is available, open booking dialog
      setSelectedSlot({
        date,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
      })
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error selecting slot:", error)
    }
  }

  const getBookingForSlot = (date: string, startTime: string): Booking | undefined => {
    return bookings.find((booking) => safeIsSameDay(booking.date, date) && booking.startTime === startTime)
  }

  const isSlotBooked = (date: string, startTime: string): boolean => {
    try {
      return bookings.some((booking) => safeIsSameDay(booking.date, date) && booking.startTime === startTime)
    } catch (error) {
      console.error("Error checking if slot is booked:", error)
      return false
    }
  }

  const handleBooking = async (name: string) => {
    if (!selectedSlot) return

    try {
      setIsLoading(true)

      const result = await createBooking({
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        userId: user?.id || "guest",
      })

      if (result.success) {
        setBookings((prev) => [...prev, result.booking!])
        setIsDialogOpen(false)

        toast({
          title: "Booking Confirmed",
          description: `You've booked the laundry room on ${safeFormat(selectedSlot.date, "EEEE, MMMM d")} from ${selectedSlot.startTime} to ${selectedSlot.endTime}.`,
        })

        // Refresh the page to get the latest data
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to create booking")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Booking Failed",
        description: "This time slot may have been booked by someone else. Please try another slot.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return

    try {
      setIsLoading(true)

      const result = await cancelBooking(bookingToDelete.id)

      if (result.success) {
        setBookings((prev) => prev.filter((booking) => booking.id !== bookingToDelete.id))
        setIsDeleteDialogOpen(false)
        setBookingToDelete(null)

        toast({
          title: "Booking Cancelled",
          description: `Your booking on ${safeFormat(bookingToDelete.date, "EEEE, MMMM d")} from ${bookingToDelete.startTime} to ${bookingToDelete.endTime} has been cancelled.`,
        })

        // Refresh the page to get the latest data
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to cancel booking")
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Week of {safeFormat(weekDates[0], "MMMM d, yyyy")}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek} disabled={isLoading}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek} disabled={isLoading}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => (
          <div key={date} className="text-center font-medium">
            <div className="mb-1">{safeFormat(date, "EEE")}</div>
            <div
              className={cn(
                "rounded-full h-8 w-8 flex items-center justify-center mx-auto",
                safeIsSameDay(date, new Date().toISOString()) && "bg-primary text-primary-foreground",
              )}
            >
              {safeFormat(date, "d")}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => (
          <div key={date} className="space-y-2">
            {getTimeSlotsForDay(date).map((timeSlot) => {
              const booking = getBookingForSlot(date, timeSlot.start)
              const isBooked = !!booking
              const currentUserIsBooker = user && booking?.userId === user.id || false

              return (
                <TimeSlot
                  key={`${date}-${timeSlot.start}`}
                  date={date}
                  startTime={timeSlot.start}
                  endTime={timeSlot.end}
                  isBooked={isBooked}
                  bookerName={booking?.user.name}
                  onClick={() => handleSlotClick(date, timeSlot)}
                  onDelete={isBooked && currentUserIsBooker ? () => handleDeleteClick(booking) : undefined}
                  disabled={isLoading}
                  currentUserIsBooker={currentUserIsBooker}
                />
              )
            })}
          </div>
        ))}
      </div>

      <BookingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleBooking}
        selectedSlot={selectedSlot}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteBooking}
        title="Cancel Booking"
        description={
          bookingToDelete
            ? `Are you sure you want to cancel your booking on ${safeFormat(
                bookingToDelete.date,
                "EEEE, MMMM d",
              )} from ${bookingToDelete.startTime} to ${bookingToDelete.endTime}?`
            : "Are you sure you want to cancel this booking?"
        }
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        isLoading={isLoading}
      />
    </div>
  )
}
