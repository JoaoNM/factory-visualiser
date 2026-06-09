import { NextResponse } from "next/server"

export const runtime = "edge"

const SYSTEM_PROMPT = `You convert a natural-language description into a single valid Mermaid flowchart.

Rules:
- Output ONLY raw Mermaid code. No markdown fences, no prose, no explanation.
- Start with a graph direction declaration, e.g. "flowchart TD" (top-down) unless the user clearly wants left-right ("flowchart LR").
- Use clear, short node labels. Give every node a stable id (A, B, C... or descriptive ids).
- Use decision diamonds {like this?} for branches and label the edges (-->|yes|).
- Keep it syntactically valid Mermaid v11. Do not invent unsupported syntax.
- If the description is vague, make reasonable assumptions rather than asking questions.
- If an existing chart is provided, keep its overall structure, ids, and labels intact and only apply the requested change. Always return the COMPLETE updated chart, not a fragment.`

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not set. Add it to .env.local and restart the dev server." },
      { status: 500 },
    )
  }

  let prompt: string
  let current: string
  try {
    const body = await req.json()
    prompt = (body?.prompt ?? "").toString().trim()
    current = (body?.current ?? "").toString().trim()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!prompt) {
    return NextResponse.json({ error: "Describe the flow you want first." }, { status: 400 })
  }

  // In modify mode, hand the model the existing chart and ask it to edit, not rebuild.
  const userContent = current
    ? `Here is the current Mermaid flowchart:\n\n${current}\n\nApply this change and return the full updated chart:\n${prompt}`
    : prompt

  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet"

  let res: Response
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "NL to Mermaid Flowchart",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 2000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    })
  } catch (e) {
    return NextResponse.json({ error: `Network error calling OpenRouter: ${String(e)}` }, { status: 502 })
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    return NextResponse.json(
      { error: `OpenRouter error (${res.status}): ${detail.slice(0, 500)}` },
      { status: 502 },
    )
  }

  const data = await res.json()
  let mermaid: string = data?.choices?.[0]?.message?.content ?? ""

  // Strip markdown fences if the model added them anyway.
  mermaid = mermaid
    .replace(/^\s*```(?:mermaid)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim()

  if (!mermaid) {
    return NextResponse.json({ error: "Model returned empty output." }, { status: 502 })
  }

  return NextResponse.json({ mermaid, model })
}
