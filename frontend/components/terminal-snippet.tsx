"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function TerminalSnippet({ command, label }: { command: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full">
      {label && (
        <span className="mb-2 block text-xs font-medium text-muted-foreground">{label}</span>
      )}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3">
        <span className="text-muted-foreground/60">$</span>
        <code className="flex-1 font-mono text-sm text-foreground">
          {command}
          <span className="animate-blink-cursor text-primary">|</span>
        </code>
        <button
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          aria-label="Copy"
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
