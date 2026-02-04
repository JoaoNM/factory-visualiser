"use client"

import { useState } from "react"
import { useFactory } from "@/lib/factory-context"
import type { ConveyorBeltData, Station } from "@/lib/factory-types"
import { StationModal } from "./station-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function PixelIcon({ name, size = 24, invert = true }: { name: string; size?: number; invert?: boolean }) {
  return (
    <img
      src={`https://unpkg.com/pixelarticons@1.8.1/svg/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated", filter: invert ? "invert(1)" : undefined }}
    />
  )
}

// Common icons for quick selection
const COMMON_ICONS = [
  "cog", "check", "search", "mail", "user", "heart", "coin", "gift",
  "truck", "archive", "chat", "briefcase", "calendar", "trophy", "zap",
  "lightbulb", "target", "edit", "loader", "clock", "eye", "bullseye"
]

interface ConveyorBeltProps {
  belt: ConveyorBeltData
}

export function ConveyorBelt({ belt }: ConveyorBeltProps) {
  const { toggleBeltRunning, addStation, getOperatorById, dispatch } = useFactory()
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [isAddingStation, setIsAddingStation] = useState(false)
  const [newStationLabel, setNewStationLabel] = useState("")
  const [newStationIcon, setNewStationIcon] = useState("cog")

  const handleAddStation = () => {
    if (newStationLabel.trim()) {
      addStation(belt.id, {
        label: newStationLabel.trim(),
        icon: newStationIcon || "cog",
        createsItems: false,
      })
      setNewStationLabel("")
      setNewStationIcon("cog")
      setIsAddingStation(false)
    }
  }

  const toggleAutoIncoming = () => {
    dispatch({
      type: "SET_AUTO_INCOMING",
      payload: { beltId: belt.id, autoIncoming: !belt.autoIncoming },
    })
  }

  const toggleNeedsOutput = () => {
    dispatch({
      type: "SET_NEEDS_OUTPUT",
      payload: { beltId: belt.id, needsOutput: !belt.needsOutput },
    })
  }

  // Find the first blocking station (first station without operators)
  const firstBlockingIndex = belt.stations.findIndex(
    (station) => station.operatorIds.length === 0
  )

  return (
    <div className="relative">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3" style={{ backgroundColor: belt.color }} />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            {belt.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Delete belt */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "REMOVE_BELT", payload: { beltId: belt.id } })}
            className="text-[10px] uppercase h-7 px-2 border-2 border-border text-muted-foreground hover:border-destructive hover:text-destructive bg-transparent"
          >
            <PixelIcon name="trash" size={12} />
          </Button>

          {/* Need Output toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNeedsOutput}
            className={`text-[10px] uppercase h-7 px-2 border-2 ${
              belt.needsOutput
                ? "border-destructive bg-destructive/20 text-destructive"
                : "border-border text-muted-foreground"
            } bg-transparent`}
          >
            <PixelIcon name="alert" size={12} />
            <span className="ml-1">Need</span>
          </Button>

          {/* Auto incoming toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoIncoming}
            className={`text-[10px] uppercase h-7 px-2 border-2 ${
              belt.autoIncoming
                ? "border-primary bg-primary/20 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            <PixelIcon name="mail" size={12} />
            <span className="ml-1">Auto</span>
          </Button>

          {/* Play/Pause */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleBeltRunning(belt.id)}
            className={`h-7 px-2 border-2 ${
              belt.isRunning
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground"
            }`}
          >
            <PixelIcon name={belt.isRunning ? "pause" : "play"} size={14} invert={!belt.isRunning} />
          </Button>
        </div>
      </div>

      {/* Conveyor Belt */}
      <div className="relative">
        {/* Belt track */}
        <div className="relative h-28 bg-conveyor border-2 border-border overflow-hidden">
          {/* Animated stripes - only animate when running */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                var(--conveyor) 0px,
                var(--conveyor) 20px,
                var(--conveyor-stripe) 20px,
                var(--conveyor-stripe) 40px
              )`,
              backgroundSize: "40px 100%",
              animation: belt.isRunning ? "conveyorMove 0.8s steps(4) infinite" : "none",
            }}
          />

          {/* Stations on belt - above items */}
          <div className="relative z-10 flex h-full">
            {belt.stations.map((station, stationIndex) => {
              const hasOperators = station.operatorIds.length > 0
              const operatorCount = station.operatorIds.length
              
              // Determine station status color
              // - Green (belt color): has operators
              // - Red: no operators AND is the first blocking station AND needsOutput is true
              // - Grey: no operators AND (needsOutput is false OR station is after the first blocker)
              const isFirstBlocker = stationIndex === firstBlockingIndex
              const showRed = !hasOperators && belt.needsOutput && isFirstBlocker
              const showGrey = !hasOperators && (!belt.needsOutput || stationIndex > firstBlockingIndex)

              return (
                <div
                  key={station.id}
                  className="flex-1 flex flex-col items-center justify-center border-r border-border/50 last:border-r-0 cursor-pointer group"
                  onClick={() => setSelectedStation(station)}
                >
                  {/* Station box */}
                  <div className="relative">
                    <div
                      className={`w-12 h-12 flex items-center justify-center border-2 transition-colors ${
                        hasOperators 
                          ? "bg-card hover:bg-card/80" 
                          : showRed 
                            ? "bg-destructive/20" 
                            : "bg-muted/30 opacity-50"
                      }`}
                      style={{ 
                        borderColor: hasOperators 
                          ? belt.color 
                          : showRed 
                            ? "var(--destructive)" 
                            : "var(--border)"
                      }}
                    >
                      <PixelIcon name={station.icon} size={20} />
                    </div>

                    {/* Operator count badge */}
                    <div
                      className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                        hasOperators
                          ? "bg-primary text-primary-foreground"
                          : showRed
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {operatorCount}
                    </div>
                  </div>

                  <span className="text-[10px] text-muted-foreground uppercase mt-1">
                    {station.label}
                  </span>

                  {/* First assigned operator preview */}
                  {hasOperators && (
                    <div className="text-[8px] text-muted-foreground truncate max-w-[60px]">
                      {getOperatorById(station.operatorIds[0])?.name}
                      {operatorCount > 1 && ` +${operatorCount - 1}`}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add station button */}
            <Popover open={isAddingStation} onOpenChange={setIsAddingStation}>
              <PopoverTrigger asChild>
                <div className="w-16 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-muted-foreground/50 hover:border-primary">
                    <PixelIcon name="plus" size={16} />
                  </div>
                  <span className="text-[8px] text-muted-foreground uppercase mt-1">Add</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 bg-card border-2 border-border">
                <div className="space-y-3">
                  <h4 className="text-xs uppercase text-foreground font-bold">New Station</h4>
                  <Input
                    placeholder="Station name..."
                    value={newStationLabel}
                    onChange={(e) => setNewStationLabel(e.target.value)}
                    className="bg-background border-2 border-border text-sm"
                  />
                  
                  {/* Icon selection */}
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground mb-1 block">
                      Select Icon
                    </label>
                    <div className="grid grid-cols-7 gap-1 p-2 bg-background border-2 border-border max-h-24 overflow-y-auto">
                      {COMMON_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setNewStationIcon(icon)}
                          className={`w-7 h-7 flex items-center justify-center border ${
                            newStationIcon === icon
                              ? "border-primary bg-primary/20"
                              : "border-transparent hover:bg-muted"
                          }`}
                        >
                          <PixelIcon name={icon} size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom icon input */}
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Or type icon name..."
                      value={newStationIcon}
                      onChange={(e) => setNewStationIcon(e.target.value)}
                      className="bg-background border-2 border-border text-sm flex-1"
                    />
                    <div className="w-8 h-8 flex items-center justify-center bg-muted border-2 border-border">
                      <PixelIcon name={newStationIcon || "cog"} size={16} />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAddStation}
                    disabled={!newStationLabel.trim()}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    Add Station
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Moving items on belt */}
          {belt.items.map((item) => {
            const stationWidth = 100 / (belt.stations.length + 1) // +1 for add button space
            const basePosition = item.currentStationIndex * stationWidth
            const progressOffset = (item.progress / 100) * stationWidth
            const leftPosition = basePosition + progressOffset + stationWidth / 2

            return (
              <div
                key={item.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${Math.min(leftPosition, 95)}%`,
                  top: "50%",
                  transform: "translateX(-50%) translateY(-50%)",
                  transition: "left 0.5s linear",
                  zIndex: 20,
                }}
              >
                <div
                  className="w-7 h-7 flex items-center justify-center bg-card border-2 shadow-lg rounded-sm"
                  style={{ borderColor: belt.color }}
                >
                  <PixelIcon name={item.icon} size={14} />
                </div>
              </div>
            )
          })}
        </div>

        </div>

      {/* Station Modal */}
      <StationModal
        station={selectedStation}
        beltId={belt.id}
        beltColor={belt.color}
        isOpen={selectedStation !== null}
        onClose={() => setSelectedStation(null)}
      />
    </div>
  )
}

export { type ConveyorBeltProps }
