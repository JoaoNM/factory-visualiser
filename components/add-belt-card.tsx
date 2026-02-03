"use client"

import { useState } from "react"
import { useFactory } from "@/lib/factory-context"
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

export function AddBeltCard() {
  const { dispatch } = useFactory()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [color, setColor] = useState(BELT_COLORS[0])
  const [itemIcon, setItemIcon] = useState("user")

  const handleAdd = () => {
    if (title.trim()) {
      dispatch({
        type: "ADD_BELT",
        payload: {
          title: title.trim(),
          color,
          itemIcon,
          stations: [],
          autoIncoming: false,
          needsOutput: true,
        },
      })
      setTitle("")
      setColor(BELT_COLORS[0])
      setItemIcon("user")
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative h-28 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors flex items-center justify-center gap-3 group">
          <div className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 group-hover:border-primary/50">
            <PixelIcon name="plus" size={20} />
          </div>
          <span className="text-sm text-muted-foreground uppercase group-hover:text-foreground">
            Add Assembly Line
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-card border-2 border-border">
        <div className="space-y-4">
          <h4 className="text-xs uppercase text-foreground font-bold">New Assembly Line</h4>

          <Input
            placeholder="Line name (e.g. Sales Pipeline)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background border-2 border-border text-sm"
          />

          {/* Color picker */}
          <div>
            <label className="text-[10px] uppercase text-muted-foreground mb-1 block">
              Line Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {BELT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 border-2 ${
                    color === c ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Item icon picker */}
          <div>
            <label className="text-[10px] uppercase text-muted-foreground mb-1 block">
              Item Icon (what moves on the belt)
            </label>
            <div className="grid grid-cols-5 gap-2 p-2 bg-background border-2 border-border">
              {ITEM_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setItemIcon(icon)}
                  className={`w-8 h-8 flex items-center justify-center border ${
                    itemIcon === icon
                      ? "border-primary bg-primary/20"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <PixelIcon name={icon} size={16} />
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAdd}
            disabled={!title.trim()}
            className="w-full bg-primary text-primary-foreground"
          >
            <PixelIcon name="plus" size={14} invert={false} />
            <span className="ml-2 uppercase text-xs">Add Line</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
