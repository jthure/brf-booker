"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TimeSlotData } from "@/lib/types"
import { useAuth } from "@/context/auth-context"

// Helper function to safely format dates
const safeFormat = (date: string | null | undefined, formatStr: string): string => {
  if (!date) return ""
  try {
    return format(parseISO(date), formatStr)
  } catch (error) {
    console.error("Date formatting error:", error)
    return ""
  }
}

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (name: string) => void
  selectedSlot: TimeSlotData | null
  isLoading?: boolean
}

export function BookingDialog({ open, onOpenChange, onConfirm, selectedSlot, isLoading = false }: BookingDialogProps) {
  const { user } = useAuth()
  const [name, setName] = useState("")

  // Set the name to the user's name when the dialog opens or user changes
  useEffect(() => {
    if (open && user) {
      setName(user.name)
    } else if (!user) {
      setName("")
    }
  }, [open, user])

  if (!selectedSlot) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(name)
    if (!user) {
      setName("") // Only clear the name if not signed in
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Laundry Room</DialogTitle>
          <DialogDescription>
            Confirm your booking for the laundry room on {safeFormat(selectedSlot.date, "EEEE, MMMM d")} from{" "}
            {selectedSlot.startTime} to {selectedSlot.endTime}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Your Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
                disabled={isLoading || !!user} // Disable if user is signed in
                readOnly={!!user} // Make read-only if user is signed in
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

