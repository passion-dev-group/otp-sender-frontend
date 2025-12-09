import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Campaign, CampaignStatus } from "./types"

interface ProcessingInterval {
  [key: string]: NodeJS.Timeout
}

const processingIntervals: ProcessingInterval = {}

interface CampaignStore {
  campaigns: Campaign[]
  archivedCampaigns: Campaign[]
  addCampaign: () => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  startCampaign: (id: string) => void
  pauseCampaign: (id: string) => void
  resumeCampaign: (id: string) => void
  archiveCampaign: (id: string) => void
  deleteCampaign: (id: string) => void
  pauseAndArchive: (id: string) => void
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
            },
            ...state.campaigns,
          ],
        }))
      },

      updateCampaign: (id, updates) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      startCampaign: (id) => {
        console.log("[v0] Starting campaign:", id)
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

      pauseCampaign: (id) => {
        console.log("[v0] Pausing campaign:", id)
        if (processingIntervals[id]) {
          clearInterval(processingIntervals[id])
          delete processingIntervals[id]
        }
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, status: "paused" as CampaignStatus } : c)),
        }))
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

      pauseAndArchive: (id) => {
        console.log("[v0] Pause and archive:", id)
        if (processingIntervals[id]) {
          clearInterval(processingIntervals[id])
          delete processingIntervals[id]
        }
        const campaign = get().campaigns.find((c) => c.id === id)
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
    },
  ),
)
