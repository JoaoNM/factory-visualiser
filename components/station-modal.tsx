"use client"

import { useState, useEffect } from "react"
import { useFactory } from "@/lib/factory-context"
import type { Station } from "@/lib/factory-types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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

interface StationModalProps {
  station: Station | null
  beltId: string
  beltColor: string
  isOpen: boolean
  onClose: () => void
}

export function StationModal({ station, beltId, beltColor, isOpen, onClose }: StationModalProps) {
  const { state, assignOperator, unassignOperator, removeStation, dispatch } = useFactory()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedLabel, setEditedLabel] = useState("")

  // Reset editing state when modal opens/closes or station changes
  useEffect(() => {
    if (station) {
      setEditedLabel(station.label)
      setIsEditingName(false)
    }
  }, [station, isOpen])

  if (!station) return null

  // Get fresh station data from state to ensure real-time updates
  const belt = state.conveyorBelts.find(b => b.id === beltId)
  const currentStation = belt?.stations.find(s => s.id === station.id) ?? station

  const assignedOperators = state.operators.filter((op) =>
    currentStation.operatorIds.includes(op.id)
  )
  const availableOperators = state.operators.filter(
    (op) => !currentStation.operatorIds.includes(op.id)
  )

  const handleToggleCreatesItems = (checked: boolean) => {
    dispatch({
      type: "UPDATE_STATION",
      payload: { beltId, stationId: currentStation.id, updates: { createsItems: checked } },
    })
  }

  const handleSaveLabel = () => {
    const trimmedLabel = editedLabel.trim()
    if (trimmedLabel && trimmedLabel !== currentStation.label) {
      dispatch({
        type: "UPDATE_STATION",
        payload: { beltId, stationId: currentStation.id, updates: { label: trimmedLabel } },
      })
    }
    setIsEditingName(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveLabel()
    } else if (e.key === "Escape") {
      setEditedLabel(currentStation.label)
      setIsEditingName(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-2 border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground uppercase">
            <div
              className="w-10 h-10 flex items-center justify-center border-2"
              style={{ borderColor: beltColor, backgroundColor: `${beltColor}20` }}
            >
              <PixelIcon name={currentStation.icon} size={20} />
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedLabel}
                  onChange={(e) => setEditedLabel(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveLabel}
                  className="h-8 text-sm uppercase bg-background border-border"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
                title="Click to rename"
              >
                {currentStation.label} Station
                <PixelIcon name="edit" size={14} />
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Assigned operators */}
          <div>
            <h4 className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-2">
              <PixelIcon name="user" size={14} />
              Assigned Operators ({assignedOperators.length})
            </h4>
            {assignedOperators.length === 0 ? (
              <div className="p-4 border-2 border-destructive/50 bg-destructive/10 text-center">
                <p className="text-xs text-destructive uppercase">No operators assigned</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Items will get stuck at this station
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {assignedOperators.map((operator) => (
                  <div
                    key={operator.id}
                    className="flex items-center justify-between p-2 bg-background border-2 border-border"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted flex items-center justify-center text-foreground font-bold text-[10px] uppercase">
                        {operator.name.slice(0, 2)}
                      </div>
                      <span className="text-sm text-foreground">{operator.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unassignOperator(beltId, station.id, operator.id)}
                      className="text-destructive hover:bg-destructive/20 h-6 px-2"
                    >
                      <PixelIcon name="minus" size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available operators to assign */}
          {availableOperators.length > 0 && (
            <div>
              <h4 className="text-xs uppercase text-muted-foreground mb-2">
                Available to Assign
              </h4>
              <div className="space-y-1">
                {availableOperators.map((operator) => (
                  <div
                    key={operator.id}
                    className="flex items-center justify-between p-2 bg-muted/30 border-2 border-border"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted flex items-center justify-center text-muted-foreground font-bold text-[10px] uppercase">
                        {operator.name.slice(0, 2)}
                      </div>
                      <span className="text-sm text-muted-foreground">{operator.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => assignOperator(beltId, station.id, operator.id)}
                      className="text-primary hover:bg-primary/20 h-6 px-2"
                    >
                      <PixelIcon name="plus" size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.operators.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Add team members in the Team panel first
            </p>
          )}

          {/* Reorder station */}
          <div>
            <h4 className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-2">
              <PixelIcon name="sort" size={14} />
              Reorder Station
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
                onClick={() => {
                  dispatch({
                    type: "REORDER_STATION",
                    payload: { beltId, stationId: currentStation.id, direction: "left" },
                  })
                }}
              >
                <PixelIcon name="chevron-left" size={16} />
                <span className="ml-1 uppercase text-xs">Move Left</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
                onClick={() => {
                  dispatch({
                    type: "REORDER_STATION",
                    payload: { beltId, stationId: currentStation.id, direction: "right" },
                  })
                }}
              >
                <span className="mr-1 uppercase text-xs">Move Right</span>
                <PixelIcon name="chevron-right" size={16} />
              </Button>
            </div>
          </div>

          {/* Delete station */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              onClick={() => {
                removeStation(beltId, currentStation.id)
                onClose()
              }}
            >
              <PixelIcon name="trash" size={16} />
              <span className="ml-2 uppercase text-xs">Remove Station</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
