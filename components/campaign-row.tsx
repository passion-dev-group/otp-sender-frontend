"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Play, Pause, AlertCircle, Trash2 } from "lucide-react"
import { useCampaignStore } from "@/lib/campaign-store"
import { PauseOptionsDialog } from "@/components/pause-options-dialog"
import type { Campaign } from "@/lib/types"
import { SERVICES, COUNTRIES, PROXIES } from "@/lib/constants"

interface CampaignRowProps {
  campaign: Campaign
}

export function CampaignRow({ campaign }: CampaignRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [showExhaustedAlert, setShowExhaustedAlert] = useState(false)
  const [exhaustedFileName, setExhaustedFileName] = useState<string | null>(null)
  const {
    updateCampaign,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
    uploadNumberList,
    deleteCampaign,
    archiveCampaign,
  } = useCampaignStore()

  useEffect(() => {
    if (campaign.status === "in_progress" && campaign.numberFile) {
      const match = campaign.numberFile.match(/(\d+[.,]\d+|\d+)/)
      if (match) {
        const totalNumbers = Number.parseInt(match[1].replace(/[,.]/g, ""))
        if (campaign.processed >= totalNumbers) {
          setExhaustedFileName(campaign.numberFile)
          setShowExhaustedAlert(true)
          pauseCampaign(campaign.id)
        }
      }
    }
  }, [campaign.processed, campaign.numberFile, campaign.status, campaign.id, pauseCampaign])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadNumberList(campaign.id, file.name)
      setShowExhaustedAlert(false)
      setExhaustedFileName(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleStart = () => {
    if (
      !campaign.service ||
      !campaign.destination ||
      !campaign.proxy ||
      !campaign.numberFile ||
      !campaign.dailyAmount
    ) {
      return
    }
    startCampaign(campaign.id)
    setShowExhaustedAlert(false)
  }

  const handlePause = () => {
    setShowPauseDialog(true)
  }

  const handleResume = () => {
    resumeCampaign(campaign.id)
    setShowExhaustedAlert(false)
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const isListExhausted = () => {
    if (campaign.status === "paused" && campaign.numberFile) {
      const match = campaign.numberFile.match(/(\d+[.,]\d+|\d+)/)
      if (match) {
        const totalNumbers = Number.parseInt(match[1].replace(/[,.]/g, ""))
        return campaign.processed >= totalNumbers
      }
    }
    return false
  }

  const getStatusButton = () => {
    switch (campaign.status) {
      case "idle":
        return (
          <div className="flex">
            <Button
              onClick={handleStart}
              disabled={
                !campaign.service ||
                !campaign.destination ||
                !campaign.proxy ||
                !campaign.numberFile ||
                !campaign.dailyAmount
              }
              className="w-28 h-8 bg-neutral-700 hover:bg-neutral-800 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              START
            </Button>
          </div>
        )
      case "in_progress":
        return (
          <div className="flex items-center gap-1">
            <div className="bg-emerald-500 text-white px-3 rounded-md text-center text-xs font-medium w-28 h-8 flex items-center justify-center">
              IN PROGRESS
            </div>
            <Button
              onClick={handlePause}
              size="icon"
              className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-md flex-shrink-0"
            >
              <Pause className="h-3.5 w-3.5" />
            </Button>
          </div>
        )
      case "paused":
        return (
          <div className="flex items-center gap-1">
            <div
              className={`bg-orange-500 text-white px-3 rounded-md text-center text-xs font-medium h-8 flex items-center justify-center w-28`}
            >
              PAUSED
            </div>
            {!showExhaustedAlert && !isListExhausted() && (
              <Button
                onClick={handleResume}
                size="icon"
                className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md flex-shrink-0"
              >
                <Play className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_1.5fr_1.5fr_0.8fr_150px_70px_50px] gap-2 px-4 py-3 border border-border rounded-md bg-card items-center hover:shadow-sm transition-shadow">
      <Select
        value={campaign.service}
        onValueChange={(value) => updateCampaign(campaign.id, { service: value })}
        disabled={campaign.status !== "idle"}
      >
        <SelectTrigger className="h-9 text-sm truncate w-full">
          <SelectValue placeholder="Select service" />
        </SelectTrigger>
        <SelectContent>
          {SERVICES.map((service) => (
            <SelectItem key={service} value={service}>
              {service}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={campaign.destination}
        onValueChange={(value) => updateCampaign(campaign.id, { destination: value })}
        disabled={campaign.status !== "idle"}
      >
        <SelectTrigger className="h-9 text-sm truncate w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {COUNTRIES.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={campaign.proxy}
        onValueChange={(value) => updateCampaign(campaign.id, { proxy: value })}
        disabled={campaign.status !== "idle"}
      >
        <SelectTrigger className="h-9 text-sm truncate w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {PROXIES.map((proxy) => (
            <SelectItem key={proxy} value={proxy}>
              {proxy}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-1.5 min-w-0">
        {showExhaustedAlert || isListExhausted() ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1.5 rounded border border-orange-200">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium">List exhausted</span>
                {exhaustedFileName && <span className="text-[10px] text-orange-500 truncate">{exhaustedFileName}</span>}
              </div>
            </div>
            <div className="flex gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => archiveCampaign(campaign.id)}
                className="flex-1 h-8 text-xs hover:bg-accent bg-transparent"
              >
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                className="flex-1 h-8 text-xs hover:bg-accent bg-transparent"
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                New List
              </Button>
            </div>
          </div>
        ) : campaign.numberFile ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs truncate font-medium">{campaign.numberFile}</span>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              className="h-9 w-full text-xs hover:bg-accent bg-transparent"
              disabled={campaign.status === "in_progress"}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload
            </Button>
          </>
        )}
      </div>

      <Input
        type="number"
        value={campaign.dailyAmount}
        onChange={(e) => updateCampaign(campaign.id, { dailyAmount: e.target.value })}
        placeholder="0"
        className="h-9 text-sm"
        disabled={campaign.status !== "idle"}
      />

      <div className="min-w-0">{getStatusButton()}</div>

      <div className="text-right font-semibold text-sm">{campaign.processed.toLocaleString()}</div>

      <div className="flex justify-center">
        {campaign.status === "idle" && (
          <Button
            onClick={() => deleteCampaign(campaign.id)}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md"
            title="Delete campaign"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <PauseOptionsDialog open={showPauseDialog} onOpenChange={setShowPauseDialog} campaignId={campaign.id} />
    </div>
  )
}
