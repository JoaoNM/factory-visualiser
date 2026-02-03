"use client"

import React from "react"

import { useState } from "react"
import { useFactory } from "@/lib/factory-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

function PixelIcon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <img
      src={`https://unpkg.com/pixelarticons@1.8.1/svg/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated", filter: "invert(1)" }}
    />
  )
}

export function TeamPanel() {
  const { state, addOperator, removeOperator } = useFactory()
  const [newName, setNewName] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleAdd = () => {
    if (newName.trim()) {
      addOperator(newName.trim())
      setNewName("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd()
    }
  }

  // Count how many stations each operator is assigned to
  const getAssignmentCount = (operatorId: string) => {
    let count = 0
    state.conveyorBelts.forEach((belt) => {
      belt.stations.forEach((station) => {
        if (station.operatorIds.includes(operatorId)) {
          count++
        }
      })
    })
    return count
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-2 border-primary bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
        >
          <PixelIcon name="users" size={16} />
          <span className="uppercase text-xs">Team</span>
          <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px]">
            {state.operators.length}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground uppercase">
            <PixelIcon name="users" size={20} />
            Team Operators
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Add new operator */}
          <div className="flex gap-2">
            <Input
              placeholder="Add operator name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-background border-2 border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/80"
            >
              <PixelIcon name="plus" size={16} />
            </Button>
          </div>

          {/* Operators list */}
          <div className="space-y-2">
            {state.operators.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <PixelIcon name="user" size={32} />
                <p className="mt-2">No operators yet</p>
                <p className="text-xs">Add team members to assign to stations</p>
              </div>
            ) : (
              state.operators.map((operator) => {
                const assignmentCount = getAssignmentCount(operator.id)
                return (
                  <div
                    key={operator.id}
                    className="flex items-center justify-between p-3 bg-background border-2 border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted flex items-center justify-center text-foreground font-bold text-xs uppercase">
                        {operator.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{operator.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {assignmentCount} station{assignmentCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOperator(operator.id)}
                      className="text-destructive hover:bg-destructive/20"
                    >
                      <PixelIcon name="trash" size={16} />
                    </Button>
                  </div>
                )
              })
            )}
          </div>

          {/* Info */}
          {state.operators.length > 0 && (
            <p className="text-[10px] text-muted-foreground text-center uppercase">
              Click stations on belts to assign operators
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
