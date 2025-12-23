import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Campaign, CampaignStatus, OtpType } from "./types"
import { createJob, cancelJob, getJobStatus } from "./api"

interface ProcessingInterval {
  [key: string]: NodeJS.Timeout
}

const processingIntervals: ProcessingInterval = {}

interface CampaignStore {
  campaigns: Campaign[]
  archivedCampaigns: Campaign[]
  addCampaign: () => void
  setPhoneFile: (id: string, file: File) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  startCampaign: (id: string) => Promise<void>
  pauseCampaign: (id: string) => Promise<void>
  resumeCampaign: (id: string) => void
  archiveCampaign: (id: string) => void
  deleteCampaign: (id: string) => void
  pauseAndArchive: (id: string) => Promise<void>
  pauseAndReplaceList: (id: string) => void
  deleteNumberList: (id: string) => void
  uploadNumberList: (id: string, fileName: string) => void
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set, get) => ({
      campaigns: [
        {
          id: "1",
          service: "Microsoft",
          link: "microsoft.com/it-it",
          destination: "Italy",
          proxy: "ProxyResidence-IT-01",
          numberFile: "500,000numberIT.xls",
          dailyAmount: "50000",
          status: "in_progress",
          processed: 644816,
          numberListHistory: ["500,000numberIT.xls"],
          createdAt: new Date(),
          otpType: "TXT" as OtpType,
        },
        {
          id: "2",
          service: "Microsoft",
          link: "microsoft.com/es-es",
          destination: "Spain",
          proxy: "ProxyResidence-ES-01",
          numberFile: "100,000numberES.xls",
          dailyAmount: "10000",
          status: "in_progress",
          processed: 181018,
          numberListHistory: ["100,000numberES.xls"],
          createdAt: new Date(),
          otpType: "TXT" as OtpType,
        },
        {
          id: "3",
          service: "Microsoft",
          link: "microsoft.com/dz-dz",
          destination: "Algeria",
          proxy: "ProxyAFR-Secure-01",
          numberFile: "200,000numberDZ.xls",
          dailyAmount: "30000",
          status: "paused",
          processed: 66414,
          numberListHistory: ["200,000numberDZ.xls"],
          createdAt: new Date(),
          otpType: "TXT" as OtpType,
        },
        {
          id: "4",
          service: "Whatsapp",
          link: "tiktok.com",
          destination: "Sweden",
          proxy: "ProxyEU-Premium-01",
          numberFile: "900,000number.xls",
          dailyAmount: "80000",
          status: "in_progress",
          processed: 264318,
          numberListHistory: ["900,000number.xls"],
          createdAt: new Date(),
          otpType: "TXT" as OtpType,
        },
      ],
      archivedCampaigns: [],

      addCampaign: () => {
        set((state) => ({
          campaigns: [
            {
              id: Math.random().toString(36).substr(2, 9),
              service: "",
              link: "",
              destination: "",
              proxy: "",
              numberFile: null,
              dailyAmount: "",
              status: "idle",
              processed: 0,
              numberListHistory: [],
              createdAt: new Date(),
              otpType: "TXT" as OtpType,
            },
            ...state.campaigns,
          ],
        }))
      },

      setPhoneFile: (id, file) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, phoneFile: file } : c
          ),
        }))
      },

      updateCampaign: (id, updates) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      startCampaign: async (id) => {
        const campaign = get().campaigns.find((c) => c.id === id)
        if (!campaign) return

        console.log("[API] Starting campaign:", id)

        // Validate required fields
        if (!campaign.service || !campaign.destination || !campaign.phoneFile) {
          console.error("Missing required fields for campaign")
          return
        }

        try {
          // Create FormData for API call
          const formData = new FormData()
          formData.append("site_name", campaign.service)
          formData.append("country_name", campaign.destination)
          // otp_type: 0 = TXT, 1 = VOICE
          const otpTypeValue = campaign.otpType === "VOICE" ? "1" : "0"
          formData.append("otp_type", otpTypeValue)
          formData.append("daily_amount", campaign.dailyAmount || "1000")
          formData.append("phone_number_list", campaign.phoneFile)

          // Call backend API
          const response = await createJob(formData)

          // Update campaign with jobId and status
          set((state) => ({
            campaigns: state.campaigns.map((c) =>
              c.id === id
                ? { ...c, status: "in_progress" as CampaignStatus, jobId: response.jobId }
                : c
            ),
          }))

          // Clear existing interval if any
          if (processingIntervals[id]) {
            clearInterval(processingIntervals[id])
          }

          // Start polling for status updates
          processingIntervals[id] = setInterval(async () => {
            try {
              const currentCampaign = get().campaigns.find((c) => c.id === id)
              if (!currentCampaign?.jobId || currentCampaign.status !== "in_progress") {
                clearInterval(processingIntervals[id])
                delete processingIntervals[id]
                return
              }

              const status = await getJobStatus(currentCampaign.jobId)

              // DEBUG: Log backend response to see what status is returned
              // console.log("[POLL] Backend status response:", status.status, "cancelled:", status.cancelled, "jobDetail:", status.jobDetail)

              // Map backend status to frontend status
              // Job is done when status is: completed, cancelled, failed, OR cancelled flag is 1
              let frontendStatus: CampaignStatus = "in_progress"
              if (["completed", "cancelled", "failed"].includes(status.status) || status.cancelled === 1) {
                frontendStatus = "completed"
                // console.log("[POLL] Setting frontend status to COMPLETED")
              }

              // Use jobDetail.completed + failed + cancelled for total processed count
              const processedCount = (status.jobDetail?.completed ?? 0) +
                (status.jobDetail?.failed ?? 0) +
                (status.jobDetail?.cancelled ?? 0)

              set((state) => ({
                campaigns: state.campaigns.map((c) =>
                  c.id === id
                    ? { ...c, processed: processedCount, status: frontendStatus }
                    : c
                ),
              }))

              // Stop polling if job is done
              if (["completed", "cancelled", "failed"].includes(status.status) || status.cancelled === 1) {
                // console.log("[POLL] Job done, stopping polling")
                clearInterval(processingIntervals[id])
                delete processingIntervals[id]
              }
            } catch (error) {
              console.error("Error polling job status:", error)
            }
          }, 5000)

        } catch (error) {
          console.error("Failed to start campaign:", error)
          // Reset status on error
          set((state) => ({
            campaigns: state.campaigns.map((c) =>
              c.id === id ? { ...c, status: "idle" as CampaignStatus } : c
            ),
          }))
        }
      },

      pauseCampaign: async (id) => {
        const campaign = get().campaigns.find((c) => c.id === id)
        console.log("[API] Pausing campaign:", id)

        // Stop polling
        if (processingIntervals[id]) {
          clearInterval(processingIntervals[id])
          delete processingIntervals[id]
        }

        // Update UI immediately
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, status: "paused" as CampaignStatus } : c
          ),
        }))

        // Cancel job on backend if it has a jobId
        if (campaign?.jobId) {
          try {
            await cancelJob(campaign.jobId)
            console.log("[API] Job cancelled successfully")
          } catch (error) {
            console.error("Failed to cancel job:", error)
          }
        }
      },

      resumeCampaign: (id) => {
        console.log("[v0] Resuming campaign:", id)
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, status: "in_progress" as CampaignStatus } : c)),
        }))

        // Clear existing interval if any
        if (processingIntervals[id]) {
          clearInterval(processingIntervals[id])
        }

        // Start processing interval
        processingIntervals[id] = setInterval(() => {
          const campaign = get().campaigns.find((c) => c.id === id)
          if (campaign?.status === "in_progress" && campaign.numberFile) {
            const match = campaign.numberFile.match(/(\d+[.,]\d+|\d+)/)
            if (match) {
              const totalNumbers = Number.parseInt(match[1].replace(/[,.]/g, ""))
              const dailyAmount = Number.parseInt(campaign.dailyAmount || "1000")
              const increment = Math.floor(Math.random() * Math.min(100, dailyAmount / 100)) + 1

              set((state) => ({
                campaigns: state.campaigns.map((c) => {
                  if (c.id === id) {
                    const newProcessed = Math.min(c.processed + increment, totalNumbers)
                    return { ...c, processed: newProcessed }
                  }
                  return c
                }),
              }))
            }
          } else {
            clearInterval(processingIntervals[id])
            delete processingIntervals[id]
          }
        }, 2000)
      },

      archiveCampaign: (id) => {
        if (processingIntervals[id]) {
          clearInterval(processingIntervals[id])
          delete processingIntervals[id]
        }
        const campaign = get().campaigns.find((c) => c.id === id)
        if (campaign && campaign.status === "paused") {
          set((state) => ({
            campaigns: state.campaigns.filter((c) => c.id !== id),
            archivedCampaigns: [
              ...state.archivedCampaigns,
              {
                ...campaign,
                status: "archived" as CampaignStatus,
                archivedAt: new Date(),
              },
            ],
          }))
        }
      },

      deleteCampaign: (id) => {
        console.log("[v0] Deleting campaign:", id)
        if (processingIntervals[id]) {
          clearInterval(processingIntervals[id])
          delete processingIntervals[id]
        }
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        }))
      },

      pauseAndArchive: async (id) => {
        console.log("[API] Pause and archive:", id)
        const campaign = get().campaigns.find((c) => c.id === id)

        // Stop polling
        if (processingIntervals[id]) {
          clearInterval(processingIntervals[id])
          delete processingIntervals[id]
        }

        // Call DELETE API if campaign has a jobId
        if (campaign?.jobId) {
          try {
            await cancelJob(campaign.jobId)
            console.log("[API] Job deleted successfully")
          } catch (error) {
            console.error("Failed to delete job:", error)
            // Continue with archiving even if API fails
          }
        }

        // Archive the campaign
        if (campaign) {
          set((state) => ({
            campaigns: state.campaigns.filter((c) => c.id !== id),
            archivedCampaigns: [
              ...state.archivedCampaigns,
              {
                ...campaign,
                status: "archived" as CampaignStatus,
                archivedAt: new Date(),
              },
            ],
          }))
        }
      },

      pauseAndReplaceList: (id) => {
        console.log("[v0] Pause and replace list:", id)
        if (processingIntervals[id]) {
          clearInterval(processingIntervals[id])
          delete processingIntervals[id]
        }
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id
              ? {
                ...c,
                status: "paused" as CampaignStatus,
                numberFile: null,
              }
              : c,
          ),
        }))
      },

      deleteNumberList: (id) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, numberFile: null } : c)),
        }))
      },

      uploadNumberList: (id, fileName) => {
        console.log("[v0] Uploading number list:", fileName, "for campaign:", id)
        const campaign = get().campaigns.find((c) => c.id === id)
        if (campaign) {
          set((state) => ({
            campaigns: state.campaigns.map((c) =>
              c.id === id
                ? {
                  ...c,
                  numberFile: fileName,
                  numberListHistory: [...c.numberListHistory, fileName],
                }
                : c,
            ),
          }))
        }
      },
    }),
    {
      name: "campaign-storage",
      // Exclude phoneFile from persistence since File objects can't be serialized
      partialize: (state) => ({
        campaigns: state.campaigns.map(c => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { phoneFile, ...rest } = c;
          return rest;
        }),
        archivedCampaigns: state.archivedCampaigns,
      }),
    },
  ),
)
