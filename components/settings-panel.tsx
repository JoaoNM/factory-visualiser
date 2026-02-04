"use client"

import React from "react"

import { useRef, useState } from "react"
import { useFactory } from "@/lib/factory-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

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

export function SettingsPanel() {
  const { exportState, importState } = useFactory()
  const [isOpen, setIsOpen] = useState(false)
  const [importJson, setImportJson] = useState("")
  const [importError, setImportError] = useState("")
  const [showImport, setShowImport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const json = exportState()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "factory-config.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    setImportError("")
    const success = importState(importJson)
    if (success) {
      setImportJson("")
      setShowImport(false)
    } else {
      setImportError("Invalid JSON format")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setImportJson(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-2 border-border bg-card text-foreground hover:bg-muted"
        >
          <PixelIcon name="sliders" size={16} />
          <span className="uppercase text-xs">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground uppercase">
            <PixelIcon name="sliders" size={20} />
            Factory Settings
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Export */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase text-muted-foreground">Export Configuration</h4>
            <p className="text-[10px] text-muted-foreground">
              Download your factory setup as a JSON file
            </p>
            <Button
              onClick={handleExport}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
            >
              <PixelIcon name="download" size={16} />
              <span className="ml-2 uppercase text-xs">Download JSON</span>
            </Button>
          </div>

          {/* Import */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase text-muted-foreground">Import Configuration</h4>
            <p className="text-[10px] text-muted-foreground">
              Load a previously saved factory setup
            </p>

            {!showImport ? (
              <Button
                variant="outline"
                onClick={() => setShowImport(true)}
                className="w-full border-2 border-border text-foreground"
              >
                <PixelIcon name="upload" size={16} />
                <span className="ml-2 uppercase text-xs">Import JSON</span>
              </Button>
            ) : (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border text-muted-foreground"
                >
                  <PixelIcon name="file" size={16} />
                  <span className="ml-2 text-xs">Choose file...</span>
                </Button>

                <Textarea
                  placeholder="Or paste JSON here..."
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="bg-background border-2 border-border text-sm font-mono min-h-[100px] max-h-[200px] resize-none"
                />

                {importError && (
                  <p className="text-xs text-destructive">{importError}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowImport(false)
                      setImportJson("")
                      setImportError("")
                    }}
                    className="flex-1 border-2 border-border text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!importJson.trim()}
                    className="flex-1 bg-primary text-primary-foreground"
                  >
                    Import
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center">
              Configuration is auto-saved to browser storage
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
