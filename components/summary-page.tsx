"use client"

import { useState } from "react"
import { useCampaignStore } from "@/lib/campaign-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Archive, FileText, TrendingUp, CalendarIcon, Filter, Layers } from "lucide-react"
import { format, subDays, isAfter, isBefore, startOfDay } from "date-fns"
import type { PeriodFilter } from "@/lib/types"
import type { DateRange } from "react-day-picker"

export function SummaryPage() {
  const { archivedCampaigns } = useCampaignStore()
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const getFilteredCampaigns = () => {
    const now = new Date()

    return archivedCampaigns.filter((campaign) => {
      if (!campaign.archivedAt) return true

      const archivedDate = startOfDay(new Date(campaign.archivedAt))

      switch (periodFilter) {
        case "3days":
          return isAfter(archivedDate, subDays(now, 3))
        case "7days":
          return isAfter(archivedDate, subDays(now, 7))
        case "30days":
          return isAfter(archivedDate, subDays(now, 30))
        case "90days":
          return isAfter(archivedDate, subDays(now, 90))
        case "custom":
          if (dateRange?.from && dateRange?.to) {
            return isAfter(archivedDate, startOfDay(dateRange.from)) && isBefore(archivedDate, startOfDay(dateRange.to))
          }
          return true
        case "all":
        default:
          return true
      }
    })
  }

  const filteredCampaigns = getFilteredCampaigns()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Archived Campaigns</h2>
          <p className="text-muted-foreground mt-1">View all completed and archived campaigns</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={periodFilter} onValueChange={(value: PeriodFilter) => setPeriodFilter(value)}>
            <SelectTrigger className="w-[180px] h-10">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3days">Last 3 days</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-4 bg-transparent">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  "Choose Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range)
                  if (range) setPeriodFilter("custom")
                }}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2 text-muted-foreground border-l pl-3">
            <Archive className="h-5 w-5" />
            <span className="text-sm font-medium">{filteredCampaigns.length} Archives</span>
          </div>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Archive className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Archived Campaigns</h3>
            <p className="text-muted-foreground max-w-sm">
              {periodFilter !== "all"
                ? "No campaigns found for the selected period. Try adjusting your filters."
                : "Campaigns that are archived will appear here. Start a campaign and archive it to see it in this summary."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-1">
                      {campaign.service || campaign.destination || "Campaign"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {campaign.destination} • ID: {campaign.id.slice(0, 8)}
                    </CardDescription>
                  </div>
                  <div className="bg-accent px-3 py-1 rounded-full">
                    <span className="text-xs font-medium">ARCHIVED</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Service:</span>
                    <span className="truncate font-medium">{campaign.service || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Processed:</span>
                    <span className="font-semibold text-lg">{campaign.processed.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Daily Amount:</span>
                    <span className="font-medium">{campaign.dailyAmount}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Proxy:</span> {campaign.proxy || "N/A"}
                    </p>
                    <div className="flex items-start gap-1.5">
                      <Layers className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Number Lists ({campaign.numberListHistory.length}):</span>
                        <div className="ml-1 mt-0.5 space-y-0.5">
                          {campaign.numberListHistory.map((file, idx) => (
                            <div key={idx} className="text-[10px] text-muted-foreground">
                              {idx + 1}. {file}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {campaign.archivedAt && (
                      <p>
                        <span className="font-medium">Archived:</span>{" "}
                        {format(new Date(campaign.archivedAt), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
