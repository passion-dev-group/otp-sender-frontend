"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CampaignLaunch } from "@/components/campaign-launch"
import { SummaryPage } from "@/components/summary-page"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Tabs defaultValue="launch" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="launch" className="text-lg font-semibold">
              REGISTRATION LAUNCH
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-lg font-semibold">
              SUMMARY
            </TabsTrigger>
          </TabsList>
          <TabsContent value="launch">
            <CampaignLaunch />
          </TabsContent>
          <TabsContent value="summary">
            <SummaryPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
