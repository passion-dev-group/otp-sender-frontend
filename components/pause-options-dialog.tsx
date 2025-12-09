"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCampaignStore } from "@/lib/campaign-store"
import { Archive, RefreshCw, Play } from "lucide-react"

interface PauseOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
}

export function PauseOptionsDialog({ open, onOpenChange, campaignId }: PauseOptionsDialogProps) {
  const { pauseAndArchive, pauseAndReplaceList, resumeCampaign } = useCampaignStore()

  const handleContinueOption = () => {
    resumeCampaign(campaignId)
    onOpenChange(false)
  }

  const handleArchiveOption = () => {
    pauseAndArchive(campaignId)
    onOpenChange(false)
  }

  const handleReplaceListOption = () => {
    pauseAndReplaceList(campaignId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Pause Campaign</DialogTitle>
          <DialogDescription>Choose how you want to proceed</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <Button
            onClick={handleContinueOption}
            className="w-full h-auto py-4 px-4 flex items-start gap-3 bg-emerald-50 hover:bg-emerald-100 text-foreground border-2 border-emerald-300 hover:border-emerald-400"
            variant="outline"
          >
            <Play className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-600" />
            <div className="flex flex-col items-start gap-1 flex-1 text-left">
              <span className="font-semibold text-sm">Continue Processing</span>
              <span className="text-xs text-muted-foreground font-normal leading-relaxed">
                Resume from where you left off
              </span>
            </div>
          </Button>

          <Button
            onClick={handleArchiveOption}
            className="w-full h-auto py-4 px-4 flex items-start gap-3 bg-card hover:bg-accent text-foreground border-2 border-border hover:border-primary"
            variant="outline"
          >
            <Archive className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col items-start gap-1 flex-1 text-left">
              <span className="font-semibold text-sm">Archive Campaign</span>
              <span className="text-xs text-muted-foreground font-normal leading-relaxed">
                Move to Summary. All processed data saved.
              </span>
            </div>
          </Button>

          <Button
            onClick={handleReplaceListOption}
            className="w-full h-auto py-4 px-4 flex items-start gap-3 bg-card hover:bg-accent text-foreground border-2 border-border hover:border-primary"
            variant="outline"
          >
            <RefreshCw className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col items-start gap-1 flex-1 text-left">
              <span className="font-semibold text-sm">Replace Number List</span>
              <span className="text-xs text-muted-foreground font-normal leading-relaxed">
                Upload new list. Previous progress kept and archived together.
              </span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
