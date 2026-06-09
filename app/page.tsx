"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { MermaidRender } from "@/components/mermaid-render"

const EXAMPLES = [
  "A customer signs up, then we email them a verification link. If they click it within 24 hours their account activates, otherwise it expires.",
  "Order checkout: check the cart, then take payment. If payment fails, retry once and then cancel. If it succeeds, reserve stock and send a confirmation.",
  "New support ticket comes in. If it's urgent, assign it to a senior agent, otherwise add it to the general queue. Once resolved, email the customer for feedback.",
]

export default function Page() {
  const [prompt, setPrompt] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  const hasChart = code.trim().length > 0

  async function generate() {
    const text = prompt.trim()
    if (!text) {
      toast.error("Describe the flow first.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the current chart so the model edits it instead of starting over.
        body: JSON.stringify({ prompt: text, current: hasChart ? code : undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Generation failed.")
        return
      }
      setCode(data.mermaid)
      setPrompt("")
    } catch (e) {
      toast.error(`Request failed: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    toast.success("Diagram code copied.")
  }

  function downloadSvg() {
    const svg = document.querySelector(".mermaid-output svg")
    if (!svg) {
      toast.error("Nothing to download yet.")
      return
    }
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "flowchart.svg"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 md:px-8">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Text to Flowchart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe a process in plain English and get a clean flowchart. Already have one? Just say what to change.
        </p>
      </header>

      <div className="grid flex-1 gap-8 lg:grid-cols-2">
        {/* Input column — fixed height, does not stretch with the diagram */}
        <section className="flex flex-col gap-3 self-start">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate()
            }}
            placeholder={
              hasChart
                ? "Describe a change, e.g. “add a step to notify the manager before approval”"
                : "e.g. A customer places an order, we check inventory, and if it's in stock we ship it, otherwise we put it on backorder…"
            }
            className="h-44 resize-none text-base leading-relaxed"
          />
          <div className="flex items-center gap-3">
            <Button onClick={generate} disabled={loading}>
              {loading ? <Spinner /> : null}
              {loading ? "Working…" : hasChart ? "Update flowchart" : "Generate flowchart"}
            </Button>
            <span className="text-xs text-muted-foreground">or ⌘ / Ctrl + Enter</span>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {hasChart ? "Start over with an example" : "Try an example"}
            </p>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(ex)
                  setCode("")
                }}
                className="rounded-md border border-border bg-card px-3 py-2.5 text-left text-sm text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {ex}
              </button>
            ))}
          </div>
        </section>

        {/* Output column — this is the one that grows */}
        <section className="flex flex-col gap-3">
          <div className="mermaid-output flex min-h-72 flex-1 items-center justify-center rounded-lg border border-border bg-card p-6">
            {hasChart ? (
              <MermaidRender code={code} />
            ) : (
              <p className="text-sm text-muted-foreground">Your flowchart will appear here.</p>
            )}
          </div>

          {hasChart ? (
            <>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyCode}>
                  Copy code
                </Button>
                <Button variant="outline" size="sm" onClick={downloadSvg}>
                  Download SVG
                </Button>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  View / edit diagram code
                </summary>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="mt-2 h-44 resize-none text-sm"
                />
              </details>
            </>
          ) : null}
        </section>
      </div>
    </main>
  )
}
