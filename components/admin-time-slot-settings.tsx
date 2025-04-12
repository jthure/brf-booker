"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateTimeSettings } from "@/actions/admin-actions"
import { useToast } from "@/hooks/use-toast"
import type { TimeSlotSettings } from "@/lib/time-slot-service"

interface AdminTimeSlotSettingsProps {
  initialSettings: TimeSlotSettings
}

export function AdminTimeSlotSettings({ initialSettings }: AdminTimeSlotSettingsProps) {
  const [settings, setSettings] = useState<TimeSlotSettings>(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSwitchChange = (day: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: checked,
      },
    }))
  }

  const handleTimeChange = (day: string, field: "startTime" | "endTime", value: string) => {
    setSettings((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateTimeSettings(settings)

      if (result.success) {
        toast({
          title: "Settings Updated",
          description: "Time slot settings have been updated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to update settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update time slot settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {days.map((day) => (
          <Card key={day}>
            <CardContent className="py-4">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center">
                <div className="w-full sm:w-1/4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${day}-enabled`}
                      checked={settings[day].enabled}
                      onCheckedChange={(checked) => handleSwitchChange(day, checked)}
                    />
                    <Label htmlFor={`${day}-enabled`} className="font-medium">
                      {day}
                    </Label>
                  </div>
                </div>

                <div className="w-full sm:w-3/4 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`${day}-start`} className="text-sm">
                      Start Time
                    </Label>
                    <Input
                      id={`${day}-start`}
                      type="time"
                      value={settings[day].startTime}
                      onChange={(e) => handleTimeChange(day, "startTime", e.target.value)}
                      disabled={!settings[day].enabled}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`${day}-end`} className="text-sm">
                      End Time
                    </Label>
                    <Input
                      id={`${day}-end`}
                      type="time"
                      value={settings[day].endTime}
                      onChange={(e) => handleTimeChange(day, "endTime", e.target.value)}
                      disabled={!settings[day].enabled}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  )
}

