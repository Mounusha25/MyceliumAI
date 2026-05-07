"use client"

import { useState, useEffect } from "react"

export interface PlatformStats {
  total_users: number
  total_questions: number
  total_answers: number
  total_forums: number
  question_upvotes: number
  answer_upvotes: number
  total_upvotes: number
}

// Sustainability impact shape returned by /api/sustainability/impact
export interface SustainabilityImpact {
  total_avoided_llm_calls: number
  total_tokens_saved: { value: number; low: number; high: number; unit: string }
  energy_saved_kwh: { value: number; low: number; high: number; unit: string }
  co2_saved_kg: { value: number; low: number; high: number; unit: string }
  tree_years_equivalent: { value: number; low: number; high: number; unit: string }
  model_params_used: {
    grid_carbon_g_per_kwh: number
    gpu_kwh_per_million_tokens: number
    overhead_factor: number
  }
}

// Legacy helper kept for backward compatibility with SustainabilityBanner
// Now derived from the API response instead of hardcoded constants.
export function deriveStats(stats: PlatformStats) {
  // These are intentionally left as simple proxies; the real calculations
  // are now in /api/sustainability/impact (see use-sustainability.ts).
  return {
    computeMinutesSaved: stats.total_upvotes * 12,   // conservative proxy
    co2SavedKg: 0,   // populated by useSustainabilityImpact() instead
    tokensReused: stats.total_answers * 15000,
    treesEquivalent: 0,  // populated by useSustainabilityImpact() instead
  }
}

export function useStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  return stats
}

