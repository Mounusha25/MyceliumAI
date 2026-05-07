"use client"

import Link from "next/link"
import { ExternalLink, MessageSquare, Cpu, Wallet, Bot } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ForestBackground } from "@/components/forest-background"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

const ASI_ONE_CHAT_URL = "https://asi1.ai/chat"
const AGENTVERSE_URL = "https://agentverse.ai"
const FETCH_DEMO_VIDEO_URL = process.env.NEXT_PUBLIC_FETCH_DEMO_URL

export default function FetchPage() {
  return (
    <div className="relative min-h-screen">
      <ForestBackground />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 lg:py-16">
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs text-primary">
              Fetch.ai Track
            </span>
          </div>
          <h1 className="font-mono text-3xl font-bold text-foreground md:text-4xl">
            Fetch.ai & ASI:One
          </h1>
          <p className="mt-2 text-muted-foreground">
            Our AI agents are built with uAgents, deployed on Agentverse, and discoverable via ASI:One.
            Chat with them below — this is the dedicated Fetch.ai experience, separate from other sponsor channels.
          </p>
        </div>

        <div className="mb-10 rounded-xl border border-border bg-card/50 p-6 lg:p-8">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-semibold text-foreground">
            <MessageSquare className="h-4 w-4 text-primary" />
            Chat with our agents
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            ASI:One is the chat UI for the Fetch.ai track. Open ASI:One, find our agents by name or handle,
            and ask questions. The coordinator routes to the specialist for detailed help and supports premium answers (0.1 FET).
          </p>
          <Button asChild size="lg" className="font-mono">
            <a
              href={ASI_ONE_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Chat on ASI:One
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <Cpu className="mb-3 h-8 w-8 text-primary" />
            <h3 className="font-mono font-semibold text-foreground">Coordinator</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Routes your question (LangGraph), answers directly or delegates to the specialist. Supports premium answers via Payment Protocol (0.1 FET).
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-5">
            <Bot className="mb-3 h-8 w-8 text-primary" />
            <h3 className="font-mono font-semibold text-foreground">Specialist</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Expert agent for detailed Q&A and code help. Receives delegated queries from the coordinator for a multi-agent workflow.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card/50 p-5">
          <Wallet className="mb-2 h-5 w-5 text-primary" />
          <h3 className="font-mono font-semibold text-foreground">Monetization</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We use the Agent Payment Protocol (FET). Say &quot;premium&quot; or &quot;pay&quot; in chat to request a paid premium answer (0.1 FET). 
            Payment is verified on the Fetch.ai network. See the README for agent addresses and how to run them locally.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card/50 p-5">
          <h3 className="font-mono font-semibold text-foreground">Fetch Demo Video (3-5 min)</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This track has multiple setup steps (uAgents, Agentverse, ASI:One, payment). Keep one dedicated 3-5 minute demo video link for judges.
          </p>
          {FETCH_DEMO_VIDEO_URL ? (
            <Button asChild className="mt-4 font-mono">
              <a href={FETCH_DEMO_VIDEO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                Watch Fetch Demo
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : (
            <code className="mt-4 inline-block rounded-md border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
              Set NEXT_PUBLIC_FETCH_DEMO_URL in .env.local to show the video link here.
            </code>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <a href={AGENTVERSE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            Deploy and discover agents on Agentverse
          </a>
          {" · "}
          <Link href="/" className="underline hover:text-foreground">Back to Home</Link>
        </p>
      </main>
      <Footer />
    </div>
  )
}
