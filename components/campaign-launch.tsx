"use client"
import { CampaignRow } from "@/components/campaign-row"
import { useCampaignStore } from "@/lib/campaign-store"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export function CampaignLaunch() {
  const { campaigns, addCampaign } = useCampaignStore()

  useEffect(() => {
    if (campaigns.length === 0) {
      addCampaign()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="px-4">
        <Button onClick={addCampaign} className="bg-primary hover:bg-primary/90 text-white">
          Add Campaign
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_1fr_0.8fr_1.5fr_0.8fr_150px_70px_50px] gap-2 px-4 py-3 border-b-2 border-border items-center">
        <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Site Name</div>
        <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Country Name</div>
        <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">OTP Type</div>
        <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Phone Numbers</div>
        <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Daily Amount</div>
        <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Status</div>
        <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wide text-right">Processed</div>
        <div></div>
      </div>

      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <CampaignRow key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  )
}
