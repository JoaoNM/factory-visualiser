"use client"

import React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import {
  type FactoryState,
  type Operator,
  type Station,
  type ConveyorBeltData,
  type WorkItem,
  DEFAULT_FACTORY_STATE,
  generateId,
} from "./factory-types"

// Actions
type FactoryAction =
  | { type: "LOAD_STATE"; payload: FactoryState }
  | { type: "ADD_OPERATOR"; payload: { name: string } }
  | { type: "REMOVE_OPERATOR"; payload: { operatorId: string } }
  | { type: "ASSIGN_OPERATOR"; payload: { beltId: string; stationId: string; operatorId: string } }
  | { type: "UNASSIGN_OPERATOR"; payload: { beltId: string; stationId: string; operatorId: string } }
  | { type: "ADD_STATION"; payload: { beltId: string; station: Omit<Station, "id" | "operatorIds"> } }
  | { type: "REMOVE_STATION"; payload: { beltId: string; stationId: string } }
  | { type: "UPDATE_STATION"; payload: { beltId: string; stationId: string; updates: Partial<Station> } }
  | { type: "REORDER_STATION"; payload: { beltId: string; stationId: string; direction: "left" | "right" } }
  | { type: "TOGGLE_BELT_RUNNING"; payload: { beltId: string } }
  | { type: "SET_AUTO_INCOMING"; payload: { beltId: string; autoIncoming: boolean } }
  | { type: "SET_NEEDS_OUTPUT"; payload: { beltId: string; needsOutput: boolean } }
  | { type: "SPAWN_ITEM"; payload: { beltId: string; atStationIndex: number } }
  | { type: "TICK_ITEMS"; payload: { beltId: string } }
  | { type: "ADD_BELT"; payload: Omit<ConveyorBeltData, "id" | "items" | "isRunning"> }
  | { type: "REMOVE_BELT"; payload: { beltId: string } }
  | { type: "UPDATE_BELT"; payload: { beltId: string; updates: Partial<ConveyorBeltData> } }

function factoryReducer(state: FactoryState, action: FactoryAction): FactoryState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload

    case "ADD_OPERATOR": {
      const newOperator: Operator = {
        id: generateId(),
        name: action.payload.name,
      }
      return { ...state, operators: [...state.operators, newOperator] }
    }

    case "REMOVE_OPERATOR": {
      // Remove from operators list and unassign from all stations
      const updatedBelts = state.conveyorBelts.map((belt) => ({
        ...belt,
        stations: belt.stations.map((station) => ({
          ...station,
          operatorIds: station.operatorIds.filter((id) => id !== action.payload.operatorId),
        })),
      }))
      return {
        ...state,
        operators: state.operators.filter((op) => op.id !== action.payload.operatorId),
        conveyorBelts: updatedBelts,
      }
    }

    case "ASSIGN_OPERATOR": {
      const { beltId, stationId, operatorId } = action.payload
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) =>
          belt.id === beltId
            ? {
                ...belt,
                stations: belt.stations.map((station) =>
                  station.id === stationId && !station.operatorIds.includes(operatorId)
                    ? { ...station, operatorIds: [...station.operatorIds, operatorId] }
                    : station
                ),
              }
            : belt
        ),
      }
    }

    case "UNASSIGN_OPERATOR": {
      const { beltId, stationId, operatorId } = action.payload
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) =>
          belt.id === beltId
            ? {
                ...belt,
                stations: belt.stations.map((station) =>
                  station.id === stationId
                    ? { ...station, operatorIds: station.operatorIds.filter((id) => id !== operatorId) }
                    : station
                ),
              }
            : belt
        ),
      }
    }

    case "ADD_STATION": {
      const { beltId, station } = action.payload
      const newStation: Station = {
        ...station,
        id: generateId(),
        operatorIds: [],
      }
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) =>
          belt.id === beltId ? { ...belt, stations: [...belt.stations, newStation] } : belt
        ),
      }
    }

    case "REMOVE_STATION": {
      const { beltId, stationId } = action.payload
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) =>
          belt.id === beltId
            ? { ...belt, stations: belt.stations.filter((s) => s.id !== stationId) }
            : belt
        ),
      }
    }

    case "UPDATE_STATION": {
      const { beltId, stationId, updates } = action.payload
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) =>
          belt.id === beltId
            ? {
                ...belt,
                stations: belt.stations.map((station) =>
                  station.id === stationId ? { ...station, ...updates } : station
                ),
              }
            : belt
        ),
      }
    }

    case "REORDER_STATION": {
      const { beltId, stationId, direction } = action.payload
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) => {
          if (belt.id !== beltId) return belt
          
          const currentIndex = belt.stations.findIndex((s) => s.id === stationId)
          if (currentIndex === -1) return belt
          
          const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1
          if (newIndex < 0 || newIndex >= belt.stations.length) return belt
          
          const newStations = [...belt.stations]
          const [moved] = newStations.splice(currentIndex, 1)
          newStations.splice(newIndex, 0, moved)
          
          return { ...belt, stations: newStations }
        }),
      }
    }

    case "TOGGLE_BELT_RUNNING": {
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) =>
          belt.id === action.payload.beltId ? { ...belt, isRunning: !belt.isRunning } : belt
        ),
      }
    }

    case "SET_AUTO_INCOMING": {
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) =>
          belt.id === action.payload.beltId ? { ...belt, autoIncoming: action.payload.autoIncoming } : belt
        ),
      }
    }

    case "SET_NEEDS_OUTPUT": {
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) =>
          belt.id === action.payload.beltId ? { ...belt, needsOutput: action.payload.needsOutput } : belt
        ),
      }
    }

    case "SPAWN_ITEM": {
      const { beltId, atStationIndex } = action.payload
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) => {
          if (belt.id !== beltId) return belt
          const newItem: WorkItem = {
            id: generateId(),
            icon: belt.itemIcon,
            currentStationIndex: atStationIndex,
            progress: 0,
          }
          return { ...belt, items: [...belt.items, newItem] }
        }),
      }
    }

    case "TICK_ITEMS": {
      const { beltId } = action.payload
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) => {
          if (belt.id !== beltId || !belt.isRunning) return belt

          const updatedItems = belt.items
            .map((item) => {
              const currentStation = belt.stations[item.currentStationIndex]
              const hasOperator = currentStation && currentStation.operatorIds.length > 0

              // Move item forward
              const newProgress = item.progress + 20

              if (newProgress >= 100) {
                // Item reached end of current station
                if (!hasOperator) {
                  // No operator at this station - item is consumed/lost
                  return null
                }
                // Move to next station
                const nextIndex = item.currentStationIndex + 1
                if (nextIndex >= belt.stations.length) {
                  // Item completed all stations, remove it
                  return null
                }
                return { ...item, currentStationIndex: nextIndex, progress: 0 }
              }

              return { ...item, progress: newProgress }
            })
            .filter((item): item is WorkItem => item !== null)

          return { ...belt, items: updatedItems }
        }),
      }
    }

    case "ADD_BELT": {
      const newBelt: ConveyorBeltData = {
        ...action.payload,
        id: generateId(),
        items: [],
        isRunning: false,
      }
      return { ...state, conveyorBelts: [...state.conveyorBelts, newBelt] }
    }

    case "REMOVE_BELT": {
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.filter((b) => b.id !== action.payload.beltId),
      }
    }

    case "UPDATE_BELT": {
      return {
        ...state,
        conveyorBelts: state.conveyorBelts.map((belt) =>
          belt.id === action.payload.beltId ? { ...belt, ...action.payload.updates } : belt
        ),
      }
    }

    default:
      return state
  }
}

interface FactoryContextType {
  state: FactoryState
  dispatch: React.Dispatch<FactoryAction>
  // Helper functions
  addOperator: (name: string) => void
  removeOperator: (operatorId: string) => void
  assignOperator: (beltId: string, stationId: string, operatorId: string) => void
  unassignOperator: (beltId: string, stationId: string, operatorId: string) => void
  addStation: (beltId: string, station: Omit<Station, "id" | "operatorIds">) => void
  removeStation: (beltId: string, stationId: string) => void
  toggleBeltRunning: (beltId: string) => void
  spawnItem: (beltId: string, atStationIndex: number) => void
  exportState: () => string
  importState: (json: string) => boolean
  getOperatorById: (id: string) => Operator | undefined
}

const FactoryContext = createContext<FactoryContextType | null>(null)

const STORAGE_KEY = "factory-assembly-line-state"

export function FactoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(factoryReducer, DEFAULT_FACTORY_STATE)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: "LOAD_STATE", payload: parsed })
      } catch (e) {
        console.error("Failed to load saved state:", e)
      }
    }
  }, [])

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Auto-start belt when all stations have operators
  useEffect(() => {
    state.conveyorBelts.forEach((belt) => {
      if (belt.isRunning) return // Already running
      if (belt.stations.length === 0) return // No stations
      
      const allStationsHaveOperators = belt.stations.every(
        (station) => station.operatorIds.length > 0
      )
      
      if (allStationsHaveOperators) {
        dispatch({ type: "TOGGLE_BELT_RUNNING", payload: { beltId: belt.id } })
      }
    })
  }, [state.conveyorBelts])

  // Tick items for all running belts
  useEffect(() => {
    const interval = setInterval(() => {
      state.conveyorBelts.forEach((belt) => {
        if (belt.isRunning) {
          dispatch({ type: "TICK_ITEMS", payload: { beltId: belt.id } })
        }
      })
    }, 700) // Slower tick for smoother feel

    return () => clearInterval(interval)
  }, [state.conveyorBelts])

  // Auto-spawn items for belts
  // Items either come from outside (autoIncoming) OR first station creates them
  useEffect(() => {
    const interval = setInterval(() => {
      state.conveyorBelts.forEach((belt) => {
        if (!belt.isRunning) return
        if (belt.stations.length === 0) return

        const firstStation = belt.stations[0]
        const firstStationHasOperator = firstStation.operatorIds.length > 0

        // Spawn items if:
        // 1. autoIncoming is ON - items come from outside (external source)
        // 2. OR first station has operators and creates items
        const shouldSpawn = belt.autoIncoming || (firstStationHasOperator && firstStation.createsItems)

        if (shouldSpawn) {
          dispatch({ type: "SPAWN_ITEM", payload: { beltId: belt.id, atStationIndex: 0 } })
        }
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [state.conveyorBelts])

  const value: FactoryContextType = {
    state,
    dispatch,
    addOperator: (name) => dispatch({ type: "ADD_OPERATOR", payload: { name } }),
    removeOperator: (operatorId) => dispatch({ type: "REMOVE_OPERATOR", payload: { operatorId } }),
    assignOperator: (beltId, stationId, operatorId) =>
      dispatch({ type: "ASSIGN_OPERATOR", payload: { beltId, stationId, operatorId } }),
    unassignOperator: (beltId, stationId, operatorId) =>
      dispatch({ type: "UNASSIGN_OPERATOR", payload: { beltId, stationId, operatorId } }),
    addStation: (beltId, station) => dispatch({ type: "ADD_STATION", payload: { beltId, station } }),
    removeStation: (beltId, stationId) => dispatch({ type: "REMOVE_STATION", payload: { beltId, stationId } }),
    toggleBeltRunning: (beltId) => dispatch({ type: "TOGGLE_BELT_RUNNING", payload: { beltId } }),
    spawnItem: (beltId, atStationIndex) => dispatch({ type: "SPAWN_ITEM", payload: { beltId, atStationIndex } }),
    exportState: () => JSON.stringify(state, null, 2),
    importState: (json) => {
      try {
        const parsed = JSON.parse(json)
        dispatch({ type: "LOAD_STATE", payload: parsed })
        return true
      } catch {
        return false
      }
    },
    getOperatorById: (id) => state.operators.find((op) => op.id === id),
  }

  return <FactoryContext.Provider value={value}>{children}</FactoryContext.Provider>
}

export function useFactory() {
  const context = useContext(FactoryContext)
  if (!context) {
    throw new Error("useFactory must be used within a FactoryProvider")
  }
  return context
}
