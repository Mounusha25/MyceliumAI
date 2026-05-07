"use client"

import { useState, useEffect } from "react"

// ── Types matching the /api/sustainability/* responses ────────────────────────

export interface SustainabilityConfig {
  model: string
  description: string
  parameters: Record<
    string,
    { value: number; unit: string; note: string }
  >
  citations: Array<{ id: string; text: string; url: string }>
}

export interface MetricWithBounds {
  value: number
  low: number
  high: number
  unit: string
}

export interface SustainabilityImpact {
  total_avoided_llm_calls: number
  total_tokens_saved: MetricWithBounds
  energy_saved_kwh: MetricWithBounds
  co2_saved_kg: MetricWithBounds
  tree_years_equivalent: MetricWithBounds
  model_params_used: {
    grid_carbon_g_per_kwh: number
    gpu_kwh_per_million_tokens: number
    overhead_factor: number
  }
}

export interface TrendPoint {
  date: string
  questions: number
  answers: number
  daily_events: number
  daily_kg_co2_saved: number
  cumulative_kg_co2_saved: number
  rolling_7d_kg_co2?: number
}

export interface TrendsResponse {
  days: number
  series: TrendPoint[]
  unit: string
}

export interface ForumBreakdown {
  forum: string
  questions: number
  upvotes: number
  co2_saved_g: number
  co2_saved_kg: number
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useSustainabilityImpact() {
  const [data, setData] = useState<SustainabilityImpact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/sustainability/impact")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [])

  return { data, loading, error }
}

export function useSustainabilityTrends(days = 30) {
  const [data, setData] = useState<TrendsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/sustainability/trends?days=${days}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [days])

  return { data, loading, error }
}

export function useSustainabilityConfig() {
  const [data, setData] = useState<SustainabilityConfig | null>(null)

  useEffect(() => {
    fetch("/api/sustainability/config")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  return data
}

export function useForumBreakdown() {
  const [data, setData] = useState<ForumBreakdown[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/sustainability/forum-breakdown")
      .then((r) => r.json())
      .then((d) => { setData(d.forums); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { data, loading }
}

// ── Carbon estimate helper (calls POST /api/sustainability/estimate) ────────

export async function estimateCarbonForQuestion(
  wordCount: number,
  answerCount: number
): Promise<{ g_saved_per_reuse: number; g_to_resolve: number } | null> {
  try {
    const r = await fetch("/api/sustainability/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word_count: wordCount, answer_count: answerCount }),
    })
    if (!r.ok) return null
    const d = await r.json()
    return {
      g_saved_per_reuse: d.co2_g_saved_per_reuse?.value ?? 0,
      g_to_resolve: d.co2_g_to_resolve_from_scratch?.value ?? 0,
    }
  } catch {
    return null
  }
}
