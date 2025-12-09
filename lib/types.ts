export type CampaignStatus = "idle" | "in_progress" | "paused" | "archived"

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
  service: ServiceType | "" // Added service field instead of link
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
}

export type PeriodFilter = "3days" | "7days" | "30days" | "90days" | "all" | "custom"
