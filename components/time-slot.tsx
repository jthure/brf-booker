"use client"

import type React from "react"

import { parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/context/auth-context"

interface TimeSlotProps {
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
  bookerName?: string
  onClick: () => void
  onDelete?: () => void
  disabled?: boolean
  currentUserIsBooker?: boolean
}

export function TimeSlot({
  date,
  startTime,
  endTime,
  isBooked,
  bookerName,
  onClick,
  onDelete,
  disabled = false,
  currentUserIsBooker = false,
}: TimeSlotProps) {
  const { user } = useAuth()

  // Safely check if the time slot is in the past
  const isPast = () => {
    try {
      const slotDate = parseISO(date)
      const [hours, minutes] = startTime.split(":").map(Number)
      slotDate.setHours(hours, minutes, 0, 0)
      return slotDate < new Date()
    } catch (error) {
      console.error("Error checking if slot is past:", error)
      return false
    }
  }

  const slotIsPast = isPast()

  // Determine the appropriate background color based on booking status and time
  const getBgColorClass = () => {
    if (isBooked) {
      return slotIsPast ? "bg-red-200 text-red-800" : "bg-red-500 text-white"
    } else {
      return slotIsPast ? "bg-green-200 text-green-800" : "bg-green-500 text-white"
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) onDelete()
  }

  return (
    <div className="relative group">
      <button
        className={cn(
          "w-full p-2 rounded-md text-sm transition-colors",
          getBgColorClass(),
          isBooked && !currentUserIsBooker ? "cursor-not-allowed" : "hover:opacity-90",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onClick={onClick}
        disabled={(!user && isBooked) || (isBooked && !currentUserIsBooker) || slotIsPast || disabled}
      >
        <div className="font-medium">{startTime}</div>
        <div className="text-xs opacity-90">to {endTime}</div>
        {isBooked && bookerName && <div className="mt-1 text-xs font-medium truncate">{bookerName}</div>}
      </button>

      {isBooked && currentUserIsBooker && !slotIsPast && onDelete && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDeleteClick}
                disabled={disabled}
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Cancel booking</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancel booking</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

