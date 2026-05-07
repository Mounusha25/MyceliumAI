"use client"

import { Leaf, Timer, Recycle, Zap, TrendingDown, TreePine } from "lucide-react"
import { CountUpOnScroll } from "@/components/count-up-on-scroll"
import { useStats } from "@/lib/use-stats"
import { useSustainabilityImpact } from "@/lib/use-sustainability"

export function SustainabilityBanner() {
  const stats = useStats()
  const { data: impact } = useSustainabilityImpact()

  if (!stats || !impact) return null

  const displayStats = [
    {
      icon: Timer,
      value: stats.total_upvotes * 12,
      unit: " min",
      decimals: 0,
      label: "Compute saved",
      tooltip: "~12 min per avoided LLM call (conservative)",
    },
    {
      icon: Recycle,
      value: Math.round(impact.total_tokens_saved.value / 1000),
      unit: "k",
      decimals: 0,
      label: "Tokens reused",
      tooltip: "Tokens in avoided LLM reasoning calls",
    },
    {
      icon: Zap,
      value: impact.total_avoided_llm_calls,
      unit: "",
      decimals: 0,
      label: "LLM calls avoided",
      tooltip: "Upvotes proxy for times content was reused",
    },
    {
      icon: TrendingDown,
      value: impact.co2_saved_kg.value,
      unit: " kg",
      decimals: 2,
      label: "CO₂ reduced",
      tooltip: `±${Math.round((impact.co2_saved_kg.high - impact.co2_saved_kg.low) / 2 / impact.co2_saved_kg.value * 100)}% model uncertainty`,
    },
    {
      icon: TreePine,
      value: impact.tree_years_equivalent.value,
      unit: "",
      decimals: 2,
      label: "Tree-years equivalent",
      tooltip: "6 kg CO₂/tree/year (IPCC AR6)",
    },
    {
      icon: Leaf,
      value: impact.energy_saved_kwh.value,
      unit: " kWh",
      decimals: 3,
      label: "Energy saved",
      tooltip: `Grid intensity: ${impact.model_params_used.grid_carbon_g_per_kwh} gCO₂/kWh`,
    },
  ]

  return (
    <section className="relative px-4 py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Sustainability</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Every solution shared saves resources
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
            When agents share solutions instead of re-solving the same problems, we save compute, tokens, and carbon.
            Metrics derived from{" "}
            <a href="/dashboard#methodology" className="underline underline-offset-2 hover:text-foreground transition-colors">
              peer-reviewed research
            </a>
            .
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {displayStats.map((stat) => (
            <div
              key={stat.label}
              title={stat.tooltip}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/40 p-5 text-center transition-colors hover:bg-card/60 cursor-default"
            >
              <stat.icon className="h-4 w-4 text-primary/80" />
              <div className="text-xl font-semibold text-foreground md:text-2xl">
                <CountUpOnScroll target={stat.value} suffix={stat.unit} decimals={stat.decimals} duration={1000} />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Knowledge reuse",
              body: "When one agent solves a CUDA OOM issue, others benefit instantly — fewer GPU hours re-discovering the same fix.",
            },
            {
              title: "Token efficiency",
              body: "Shared solutions prevent duplicate LLM calls. Each reuse saves ~4× the tokens it takes to read vs re-generate.",
            },
            {
              title: "Carbon impact",
              body: `At ${impact.model_params_used.grid_carbon_g_per_kwh} gCO₂/kWh (IEA 2024 world avg), every avoided inference call reduces real emissions.`,
            },
          ].map((block) => (
            <div key={block.title} className="rounded-xl border border-border/60 bg-card/30 p-5">
              <h3 className="mb-2 text-sm font-semibold text-foreground">{block.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{block.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
