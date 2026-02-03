// Core types for the factory assembly line system

export interface Operator {
  id: string
  name: string
  avatar?: string // Optional, could be initials or icon
}

export interface Station {
  id: string
  label: string
  icon: string
  operatorIds: string[] // Operators assigned to this station
  createsItems: boolean // If true, this station spawns new items
}

export interface WorkItem {
  id: string
  icon: string
  currentStationIndex: number // Which station it's at (or between)
  progress: number // 0-100, for blocky animation between stations
  stuckAt?: number // Station index where item is stuck (no operator)
}

export interface ConveyorBeltData {
  id: string
  title: string
  color: string
  itemIcon: string
  stations: Station[]
  autoIncoming: boolean // If true, items automatically arrive at first station
  needsOutput: boolean // If false, unstaffed stations show yellow instead of red
  items: WorkItem[]
  isRunning: boolean
}

export interface FactoryState {
  operators: Operator[]
  conveyorBelts: ConveyorBeltData[]
}

// Default factory configuration
export const DEFAULT_FACTORY_STATE: FactoryState = {
  operators: [],
  conveyorBelts: [
    {
      id: "marketing",
      title: "Marketing Pipeline",
      color: "#4ade80",
      itemIcon: "user",
      autoIncoming: false,
      needsOutput: true,
      isRunning: false,
      items: [],
      stations: [
        { id: "m1", label: "Ideate", icon: "lightbulb", operatorIds: [], createsItems: true },
        { id: "m2", label: "Create", icon: "edit", operatorIds: [], createsItems: false },
        { id: "m3", label: "Publish", icon: "mail", operatorIds: [], createsItems: false },
        { id: "m4", label: "Analyze", icon: "chart-bar", operatorIds: [], createsItems: false },
      ],
    },
    {
      id: "fulfilment",
      title: "Fulfilment Line",
      color: "#facc15",
      itemIcon: "gift",
      autoIncoming: true, // Orders come in automatically
      needsOutput: true,
      isRunning: false,
      items: [],
      stations: [
        { id: "f1", label: "Receive", icon: "mail", operatorIds: [], createsItems: false },
        { id: "f2", label: "Process", icon: "loader", operatorIds: [], createsItems: false },
        { id: "f3", label: "Pack", icon: "archive", operatorIds: [], createsItems: false },
        { id: "f4", label: "Ship", icon: "truck", operatorIds: [], createsItems: false },
      ],
    },
    {
      id: "hiring",
      title: "Hiring Process",
      color: "#f97316",
      itemIcon: "briefcase",
      autoIncoming: false,
      needsOutput: false, // Not urgent by default
      isRunning: false,
      items: [],
      stations: [
        { id: "h1", label: "Source", icon: "search", operatorIds: [], createsItems: true },
        { id: "h2", label: "Screen", icon: "contact-multiple", operatorIds: [], createsItems: false },
        { id: "h3", label: "Interview", icon: "chat", operatorIds: [], createsItems: false },
        { id: "h4", label: "Offer", icon: "trophy", operatorIds: [], createsItems: false },
      ],
    },
    {
      id: "coaching",
      title: "Coaching Journey",
      color: "#60a5fa",
      itemIcon: "human-run",
      autoIncoming: false,
      needsOutput: true,
      isRunning: false,
      items: [],
      stations: [
        { id: "c1", label: "Assess", icon: "bullseye", operatorIds: [], createsItems: true },
        { id: "c2", label: "Plan", icon: "calendar", operatorIds: [], createsItems: false },
        { id: "c3", label: "Execute", icon: "zap", operatorIds: [], createsItems: false },
        { id: "c4", label: "Review", icon: "check", operatorIds: [], createsItems: false },
      ],
    },
  ],
}

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
