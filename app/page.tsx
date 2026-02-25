"use client"

import { useState } from "react"
import { FactoryProvider, useFactory } from "@/lib/factory-context"
import { ConveyorBelt } from "@/components/conveyor-belt"
import { TeamPanel } from "@/components/team-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { AddBeltCard } from "@/components/add-belt-card" // Added import for AddBeltCard

const BELT_COLORS = [
  "#4ade80", // green
  "#facc15", // yellow
  "#f97316", // orange
  "#60a5fa", // blue
  "#a78bfa", // violet
  "#f472b6", // pink
  "#22d3ee", // cyan
  "#ef4444", // red
]

const ITEM_ICONS = [
  "user", "gift", "briefcase", "human-run", "mail", "coin", 
  "document", "heart", "lightbulb", "cog"
]

function PixelIcon({ name, size = 24, invert = false }: { name: string; size?: number; invert?: boolean }) {
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

function FactoryFloor() {
  const { state } = useFactory()

  // Count bottlenecks - only the FIRST blocking station on belts that need output
  const bottleneckCount = state.conveyorBelts.reduce((acc, belt) => {
    if (!belt.needsOutput) return acc // Skip belts that don't need output
    const hasBlocker = belt.stations.some((s) => s.operatorIds.length === 0)
    return acc + (hasBlocker ? 1 : 0)
  }, 0)

  // Count running belts
  const runningBelts = state.conveyorBelts.filter((b) => b.isRunning).length

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <ThemeToggle />
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <PixelIcon name="buildings" size={20} />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight">
                Factory Floor
              </h1>
            </div>
            <p className="text-muted-foreground text-xs uppercase">
              Everything is an assembly line. Assign operators to run your processes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-2 border-border bg-transparent text-foreground hover:bg-muted">
                  <PixelIcon name="script" size={16} invert />
                  <span className="uppercase text-xs">{"Elon's Rules"}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground uppercase flex items-center gap-2">
                    <PixelIcon name="script" size={20} />
                    The 5 Rules
                  </DialogTitle>
                </DialogHeader>
                <ol className="space-y-3 text-sm text-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">1.</span>
                    <span>Question every requirement</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">2.</span>
                    <span>Delete as many steps as you can</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">3.</span>
                    <span>Simplify / optimize — only after deleting</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">4.</span>
                    <span>Accelerate cycle time</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">5.</span>
                    <span>Automate last</span>
                  </li>
                </ol>
              </DialogContent>
            </Dialog>
            <TeamPanel />
            <SettingsPanel />
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card border-2 border-border">
            <div className="w-2 h-2 bg-primary" />
            <span className="text-muted-foreground uppercase">
              {runningBelts}/{state.conveyorBelts.length} Running
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card border-2 border-border">
            <div className="w-2 h-2 bg-accent" />
            <span className="text-muted-foreground uppercase">
              {state.operators.length} Operators
            </span>
          </div>
          {bottleneckCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/20 border-2 border-destructive">
              <div className="w-2 h-2 bg-destructive animate-pulse" />
              <span className="text-destructive uppercase">
                {bottleneckCount} Bottleneck{bottleneckCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Assembly Lines Grid */}
      <div className="grid gap-6 md:gap-8">
        {state.conveyorBelts.map((belt) => (
          <ConveyorBelt key={belt.id} belt={belt} />
        ))}
        
        {/* Add new belt */}
        <AddBeltCard />
      </div>

      {/* Footer hint */}
      <footer className="mt-10 pt-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center uppercase">
          Click stations to assign operators | Red badge = bottleneck | Press play to run
        </p>
      </footer>
    </div>
  )
}

export default function AssemblyLinePage() {
  return (
    <FactoryProvider>
      <FactoryFloor />
    </FactoryProvider>
  )
}
