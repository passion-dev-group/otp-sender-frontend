"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CampaignLaunch } from "@/components/campaign-launch"
import { SummaryPage } from "@/components/summary-page"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = window.localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

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
