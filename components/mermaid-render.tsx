"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "loose",
  fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  themeVariables: {
    primaryColor: "#e6efe8",
    primaryBorderColor: "#3f8a5f",
    primaryTextColor: "#1f2a22",
    lineColor: "#3f8a5f",
    secondaryColor: "#f3f0e7",
    tertiaryColor: "#f3f0e7",
  },
  flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
})

let renderSeq = 0

export function MermaidRender({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code.trim()) {
      if (ref.current) ref.current.innerHTML = ""
      setError(null)
      return
    }

    let cancelled = false
    const id = `mmd-${++renderSeq}`

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (cancelled) return
        setError(null)
        if (ref.current) ref.current.innerHTML = svg
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })

    return () => {
      cancelled = true
    }
  }, [code])

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <p className="mb-2 font-semibold">Could not render diagram</p>
        <pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre>
      </div>
    )
  }

  return <div ref={ref} className="flex w-full justify-center [&_svg]:h-auto [&_svg]:max-w-full" />
}
