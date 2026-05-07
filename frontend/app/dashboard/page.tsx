"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts"
import { Leaf, Zap, TreePine, TrendingDown, ExternalLink, Info, Activity } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ForestBackground } from "@/components/forest-background"
import { Footer } from "@/components/footer"
import {
  useSustainabilityImpact,
  useSustainabilityTrends,
  useSustainabilityConfig,
  useForumBreakdown,
} from "@/lib/use-sustainability"

// ── Tiny helpers ─────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  low,
  high,
  note,
}: {
  icon: React.ElementType
  label: string
  value: number
  unit: string
  low?: number
  high?: number
  note?: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary/70" />
        {label}
      </div>
      <div className="text-2xl font-semibold text-foreground">
        {typeof value === "number" && value < 0.01 && value > 0
          ? value.toExponential(2)
          : value.toLocaleString(undefined, { maximumFractionDigits: 3 })}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
      </div>
      {low !== undefined && high !== undefined && (
        <div className="text-[11px] text-muted-foreground">
          90% CI: [{low.toLocaleString(undefined, { maximumFractionDigits: 4 })},{" "}
          {high.toLocaleString(undefined, { maximumFractionDigits: 4 })}]
        </div>
      )}
      {note && <div className="text-[11px] text-muted-foreground/70">{note}</div>}
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

// ── Custom tooltip for recharts ───────────────────────────────────────────────

function Co2Tooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="mb-1 font-medium text-foreground">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">
            {typeof p.value === "number" ? p.value.toFixed(6) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [trendDays, setTrendDays] = useState(30)

  const { data: impact, loading: impactLoading } = useSustainabilityImpact()
  const { data: trends, loading: trendsLoading } = useSustainabilityTrends(trendDays)
  const config = useSustainabilityConfig()
  const { data: forums, loading: forumsLoading } = useForumBreakdown()

  return (
    <div className="relative min-h-screen">
      <ForestBackground />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs text-primary">
              Sustainability Analytics
            </span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            Impact Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Live metrics on compute reuse, energy savings, and CO₂ avoided — all derived from
            peer-reviewed energy research. Point estimates shown with 90% confidence intervals
            reflecting model uncertainty.
          </p>
        </div>

        {/* ── KPI cards ─────────────────────────────────────────────────── */}
        <section className="mb-12">
          <SectionHeader
            title="Platform impact"
            subtitle="Computed from live ES aggregations using the linear token-energy model."
          />
          {impactLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/30" />
              ))}
            </div>
          ) : impact ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Zap}
                label="LLM calls avoided"
                value={impact.total_avoided_llm_calls}
                unit="calls"
                note="Upvotes proxy for content reuse events"
              />
              <MetricCard
                icon={Activity}
                label="Tokens saved"
                value={Math.round(impact.total_tokens_saved.value / 1000)}
                unit="k tokens"
                low={Math.round(impact.total_tokens_saved.low / 1000)}
                high={Math.round(impact.total_tokens_saved.high / 1000)}
              />
              <MetricCard
                icon={TrendingDown}
                label="CO₂ saved"
                value={impact.co2_saved_kg.value}
                unit="kgCO₂eq"
                low={impact.co2_saved_kg.low}
                high={impact.co2_saved_kg.high}
                note="Patterson 2021 · IEA 2024"
              />
              <MetricCard
                icon={TreePine}
                label="Tree-years equivalent"
                value={impact.tree_years_equivalent.value}
                unit="tree-years"
                low={impact.tree_years_equivalent.low}
                high={impact.tree_years_equivalent.high}
                note="6 kgCO₂/tree/year (IPCC AR6)"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Could not load impact data.</p>
          )}
        </section>

        {/* ── CO₂ trend chart ───────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              title="CO₂ savings over time"
              subtitle="Daily and cumulative CO₂ avoided, with 7-day rolling average smoothing."
            />
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setTrendDays(d)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    trendDays === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {trendsLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-muted/30" />
          ) : trends && trends.series.length > 0 ? (
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trends.series} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v.toFixed(4)}`}
                  />
                  <Tooltip content={<Co2Tooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="cumulative_kg_co2_saved"
                    name="Cumulative CO₂ saved (kg)"
                    stroke="hsl(var(--primary))"
                    fill="url(#gradCumulative)"
                    strokeWidth={2}
                    dot={false}
                  />
                  {trends.series[0]?.rolling_7d_kg_co2 !== undefined && (
                    <Area
                      type="monotone"
                      dataKey="rolling_7d_kg_co2"
                      name="7-day rolling avg (kg/day)"
                      stroke="hsl(var(--primary) / 0.5)"
                      fill="none"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      dot={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No trend data available yet.</p>
          )}
        </section>

        {/* ── Activity chart ────────────────────────────────────────────── */}
        <section className="mb-12">
          <SectionHeader
            title="Daily activity"
            subtitle="Questions and answers posted per day."
          />
          {trendsLoading ? (
            <div className="h-48 animate-pulse rounded-xl bg-muted/30" />
          ) : trends && trends.series.length > 0 ? (
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trends.series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<Co2Tooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="questions" name="Questions" fill="hsl(var(--primary) / 0.7)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="answers" name="Answers" fill="hsl(var(--primary) / 0.35)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </section>

        {/* ── Forum breakdown bar chart ─────────────────────────────────── */}
        <section className="mb-12">
          <SectionHeader
            title="CO₂ savings by forum"
            subtitle="Where knowledge reuse has the highest sustainability impact."
          />
          {forumsLoading ? (
            <div className="h-48 animate-pulse rounded-xl bg-muted/30" />
          ) : forums && forums.length > 0 ? (
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={forums}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 80, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v.toFixed(3)} kg`}
                  />
                  <YAxis
                    dataKey="forum"
                    type="category"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={75}
                  />
                  <Tooltip content={<Co2Tooltip />} />
                  <Bar
                    dataKey="co2_saved_kg"
                    name="CO₂ saved (kg)"
                    fill="hsl(var(--primary) / 0.65)"
                    radius={[0, 3, 3, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </section>

        {/* ── Methodology / citations ───────────────────────────────────── */}
        <section id="methodology" className="mb-12">
          <SectionHeader
            title="Model methodology"
            subtitle="How CO₂ estimates are calculated — fully configurable via environment variables."
          />
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 space-y-5">
            <div className="rounded-lg bg-muted/30 p-4 font-mono text-xs text-foreground leading-relaxed">
              <span className="text-primary">CO₂ (gCO₂eq)</span> ={" "}
              <span className="text-muted-foreground">tokens</span> ×{" "}
              <span className="text-muted-foreground">(kWh / M_tokens)</span> ×{" "}
              <span className="text-muted-foreground">overhead_factor</span> ×{" "}
              <span className="text-muted-foreground">grid_intensity</span>
            </div>

            {config ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(config.parameters).map(([key, param]) => (
                  <div key={key} className="rounded-lg border border-border/40 bg-card/30 p-3">
                    <div className="mb-1 font-mono text-xs text-primary">{key}</div>
                    <div className="text-sm font-semibold text-foreground">
                      {param.value} <span className="text-xs font-normal text-muted-foreground">{param.unit}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{param.note}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 animate-pulse rounded-lg bg-muted/30" />
            )}

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                <Info className="h-4 w-4 text-primary/70" />
                References
              </div>
              <div className="space-y-2">
                {config?.citations.map((c) => (
                  <a
                    key={c.id}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-primary/50 group-hover:text-primary/80" />
                    {c.text}
                  </a>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
              All parameters are overridable via environment variables (e.g.{" "}
              <code className="font-mono text-primary/80">GRID_CARBON_G_PER_KWH</code> for your
              region). Confidence intervals reflect ±{config ? Math.round((config.parameters.uncertainty_fraction?.value ?? 0.3) * 100) : 30}%
              model uncertainty per Lannelongue et al. (2021).
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
