export type CampaignStatus = "idle" | "in_progress" | "paused" | "archived" | "completed"

export type OtpType = "TXT" | "VOICE"

export type ServiceType =
  | "Telegram"
  | "Google"
  | "Yahoo"
  | "Tinder"
  | "Proton"
  | "Ebay"
  | "Amazon"
  | "Hinge"
  | "Whatsapp"
  | "Uber"
  | "Paypal"
  | "Fiverr"
  | "Walt"
  | "Steam"
  | "Bolt"
  | "Wechat"
  | "Microsoft"
  | "Blablacar"

export interface Campaign {
  id: string
  service: ServiceType | string | "" // Allow dynamic service names from API
  link: string
  destination: string
  proxy: string
  numberFile: string | null
  dailyAmount: string
  status: CampaignStatus
  processed: number
  numberListHistory: string[]
  createdAt: Date
  archivedAt?: Date
  // New fields for backend integration
  jobId?: string        // Backend job ID
  otpType: OtpType      // TXT or VOICE
  phoneFile?: File      // Actual file for upload
}

export type PeriodFilter = "3days" | "7days" | "30days" | "90days" | "all" | "custom"

