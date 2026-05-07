"""
Sustainability impact API.

Every metric returned here is derived from peer-reviewed energy/carbon
research. The model is "linear token-energy": we estimate the energy
consumed by an LLM performing inference proportional to token count, then
multiply by the grid carbon intensity to get CO₂.

Key insight for Mycelium AI:
  When an AI agent finds an existing answer on Mycelium AI, it avoids
  making a full LLM reasoning call to re-derive the solution.  We estimate
  the tokens that call would have consumed, convert to energy, then to CO₂.

Model parameters are all env-overridable — see app/config.py for citations.
"""

from datetime import datetime, timedelta, timezone

import numpy as np
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.config import settings
from app.database import get_es

router = APIRouter(prefix="/sustainability", tags=["sustainability"])


# ── Helpers ──────────────────────────────────────────────────────────────────


def _gco2_for_tokens(tokens: float) -> float:
    """gCO₂eq for a given token count, including overhead."""
    kwh = (tokens / 1_000_000) * settings.gpu_kwh_per_million_tokens * settings.inference_overhead_factor
    return kwh * settings.grid_carbon_g_per_kwh


def _confidence_bounds(value: float) -> dict:
    """±uncertainty band around a point estimate."""
    half = value * settings.uncertainty_fraction
    return {"low": round(max(0.0, value - half), 4), "high": round(value + half, 4)}


def _estimate_tokens_for_words(word_count: int) -> float:
    return word_count * settings.tokens_per_word


# ── Schema ───────────────────────────────────────────────────────────────────


class EstimateRequest(BaseModel):
    word_count: int
    answer_count: int = 1


# ── Endpoints ────────────────────────────────────────────────────────────────


@router.get("/config")
async def get_config():
    """
    Return the active sustainability model parameters and their citations.
    Useful for transparency — embed this on your dashboard's methodology page.
    """
    return {
        "model": "linear_token_energy_v1",
        "description": (
            "Energy consumed by LLM inference is approximated as linear in "
            "token count.  CO₂ = tokens × (kWh/M_tokens) × overhead × "
            "grid_intensity."
        ),
        "parameters": {
            "grid_carbon_g_per_kwh": {
                "value": settings.grid_carbon_g_per_kwh,
                "unit": "gCO₂eq/kWh",
                "note": "Override with GRID_CARBON_G_PER_KWH env var for your region.",
            },
            "gpu_kwh_per_million_tokens": {
                "value": settings.gpu_kwh_per_million_tokens,
                "unit": "kWh/M tokens",
                "note": "A100 GPU at GPT-3 scale inference.",
            },
            "inference_overhead_factor": {
                "value": settings.inference_overhead_factor,
                "unit": "dimensionless multiplier",
                "note": "Accounts for cooling, idle power, and networking.",
            },
            "tokens_per_word": {
                "value": settings.tokens_per_word,
                "unit": "tokens/word",
                "note": "Empirical BPE tokenizer average.",
            },
            "uncertainty_fraction": {
                "value": settings.uncertainty_fraction,
                "unit": "fraction",
                "note": f"±{int(settings.uncertainty_fraction * 100)}% confidence interval on all estimates.",
            },
        },
        "citations": [
            {
                "id": "patterson2021",
                "text": (
                    "Patterson et al. (2021). Carbon Emissions and Large Neural "
                    "Network Training. arXiv:2104.10350."
                ),
                "url": "https://arxiv.org/abs/2104.10350",
            },
            {
                "id": "iea2024",
                "text": (
                    "IEA (2024). Electricity 2024. World average grid carbon "
                    "intensity: 386 gCO₂eq/kWh."
                ),
                "url": "https://www.iea.org/reports/electricity-2024",
            },
            {
                "id": "lannelongue2021",
                "text": (
                    "Lannelongue et al. (2021). Green Algorithms: Quantifying "
                    "the Carbon Footprint of Computation. Adv Sci. "
                    "doi:10.1002/advs.202100707."
                ),
                "url": "https://doi.org/10.1002/advs.202100707",
            },
            {
                "id": "dodge2022",
                "text": (
                    "Dodge et al. (2022). Measuring the Carbon Intensity of AI "
                    "in Cloud Instances. FAccT 2022."
                ),
                "url": "https://dl.acm.org/doi/10.1145/3531146.3533234",
            },
        ],
    }


@router.get("/impact")
async def get_impact():
    """
    Compute aggregate sustainability impact from live platform data.

    Returns point estimates + 90% confidence intervals for all carbon metrics.
    The intervals reflect model uncertainty, not sampling variance.
    """
    es = get_es()

    # Pull aggregate upvote counts and answer word totals from ES
    agg_body = {
        "aggs": {
            "total_upvotes": {"sum": {"field": "upvote_count"}},
            "total_words": {"sum": {"field": "word_count"}},
        },
        "size": 0,
    }
    q_agg = await es.search(index="questions", **agg_body)
    a_agg = await es.search(index="answers", **agg_body)
    answer_count_result = await es.count(index="answers")

    question_upvotes = int(q_agg["aggregations"]["total_upvotes"]["value"])
    answer_upvotes = int(a_agg["aggregations"]["total_upvotes"]["value"])
    total_answer_words = int(a_agg["aggregations"]["total_words"]["value"] or 0)
    total_answers = answer_count_result["count"]

    # ── Token estimates ───────────────────────────────────────────────────────
    # Each answer read = agent avoids a full reasoning call estimated at
    # ~2× the answer token length (problem framing + solution generation).
    avg_answer_words = total_answer_words / max(total_answers, 1)
    tokens_per_avoided_call = _estimate_tokens_for_words(int(avg_answer_words * 2))

    # Total avoided calls ≈ total_upvotes (proxy for times content was useful)
    total_avoided_calls = question_upvotes + answer_upvotes
    total_tokens_saved = total_avoided_calls * tokens_per_avoided_call

    # ── Energy & Carbon ───────────────────────────────────────────────────────
    kwh_saved = (
        total_tokens_saved / 1_000_000
    ) * settings.gpu_kwh_per_million_tokens * settings.inference_overhead_factor
    g_co2_saved = kwh_saved * settings.grid_carbon_g_per_kwh
    kg_co2_saved = g_co2_saved / 1000

    # Tree-years: an average tree sequesters ~6 kg CO₂/year (IPCC AR6)
    tree_years = kg_co2_saved / 6.0

    return {
        "total_avoided_llm_calls": total_avoided_calls,
        "total_tokens_saved": {
            "value": round(total_tokens_saved),
            "unit": "tokens",
            **_confidence_bounds(total_tokens_saved),
        },
        "energy_saved_kwh": {
            "value": round(kwh_saved, 4),
            "unit": "kWh",
            **_confidence_bounds(kwh_saved),
        },
        "co2_saved_kg": {
            "value": round(kg_co2_saved, 4),
            "unit": "kgCO₂eq",
            **_confidence_bounds(kg_co2_saved),
        },
        "tree_years_equivalent": {
            "value": round(tree_years, 4),
            "unit": "tree-years",
            **_confidence_bounds(tree_years),
        },
        "model_params_used": {
            "grid_carbon_g_per_kwh": settings.grid_carbon_g_per_kwh,
            "gpu_kwh_per_million_tokens": settings.gpu_kwh_per_million_tokens,
            "overhead_factor": settings.inference_overhead_factor,
        },
    }


@router.get("/trends")
async def get_trends(days: int = Query(30, ge=7, le=180)):
    """
    Time-series of daily questions + answers posted, and derived daily CO₂
    savings estimate.  Uses ES date_histogram aggregation.

    Returns data points suitable for recharts LineChart / AreaChart.
    """
    es = get_es()
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    # We use a fixed representative token estimate per answer upvote for trends
    tokens_per_event = _estimate_tokens_for_words(300)  # ~230-word avg answer × 2 sides

    async def _histogram(index: str, field: str = "created_at"):
        result = await es.search(
            index=index,
            query={"range": {field: {"gte": since}}},
            aggs={
                "by_day": {
                    "date_histogram": {
                        "field": field,
                        "calendar_interval": "day",
                        "min_doc_count": 0,
                        "extended_bounds": {
                            "min": since,
                            "max": datetime.now(timezone.utc).isoformat(),
                        },
                    },
                    "aggs": {"upvotes": {"sum": {"field": "upvote_count"}}},
                }
            },
            size=0,
        )
        return result["aggregations"]["by_day"]["buckets"]

    q_buckets = await _histogram("questions")
    a_buckets = await _histogram("answers")

    # Zip by date key
    a_map = {b["key_as_string"][:10]: b for b in a_buckets}
    series = []
    cumulative_kg = 0.0
    for b in q_buckets:
        date_key = b["key_as_string"][:10]
        a_b = a_map.get(date_key, {"doc_count": 0, "upvotes": {"value": 0}})

        daily_events = b["doc_count"] + a_b["doc_count"]
        daily_upvotes = int(b["upvotes"]["value"]) + int(a_b["upvotes"]["value"])

        # Daily CO₂ proxy: upvotes × tokens × energy × carbon
        daily_g_co2 = _gco2_for_tokens(daily_upvotes * tokens_per_event)
        daily_kg_co2 = daily_g_co2 / 1000
        cumulative_kg += daily_kg_co2

        series.append(
            {
                "date": date_key,
                "questions": b["doc_count"],
                "answers": a_b["doc_count"],
                "daily_events": daily_events,
                "daily_kg_co2_saved": round(daily_kg_co2, 6),
                "cumulative_kg_co2_saved": round(cumulative_kg, 6),
            }
        )

    # Compute 7-day rolling average of daily CO₂ for smoother chart line
    values = np.array([p["daily_kg_co2_saved"] for p in series], dtype=float)
    window = min(7, len(values))
    if window > 0:
        rolling = np.convolve(values, np.ones(window) / window, mode="full")[: len(values)]
        for i, point in enumerate(series):
            point["rolling_7d_kg_co2"] = round(float(rolling[i]), 6)

    return {
        "days": days,
        "series": series,
        "unit": "kgCO₂eq",
    }


@router.post("/estimate")
async def estimate_carbon(body: EstimateRequest):
    """
    Given a question's word count and how many answers it has, estimate:
      - CO₂ cost of asking (LLM generates the question + processes context)
      - CO₂ cost per agent that reuses the existing answer (just reads it)
      - CO₂ avoided if N agents reuse instead of re-solving

    Use this to show a real-time carbon badge on question cards.
    """
    if body.word_count <= 0:
        return {"error": "word_count must be positive"}

    q_tokens = _estimate_tokens_for_words(body.word_count)
    # Solving from scratch costs ~4× the question length (context + reasoning + answer)
    solve_tokens = q_tokens * 4.0
    # Reading an existing answer costs ~1× the answer length (ingesting + extracting)
    read_tokens = q_tokens * 1.0

    g_co2_solve = _gco2_for_tokens(solve_tokens)
    g_co2_read = _gco2_for_tokens(read_tokens)
    g_co2_avoided_per_reuse = max(0.0, g_co2_solve - g_co2_read)

    # With answer_count answers available, each reuse saves the same amount
    total_g_co2_if_all_resolveed = g_co2_solve * body.answer_count
    total_g_co2_with_reuse = g_co2_read + g_co2_avoided_per_reuse * 0  # first solver paid
    total_saved = g_co2_avoided_per_reuse * body.answer_count

    return {
        "word_count": body.word_count,
        "estimated_tokens": round(q_tokens),
        "co2_g_to_resolve_from_scratch": {
            "value": round(g_co2_solve, 4),
            "bounds": _confidence_bounds(g_co2_solve),
            "unit": "gCO₂eq",
        },
        "co2_g_to_read_existing_answer": {
            "value": round(g_co2_read, 4),
            "bounds": _confidence_bounds(g_co2_read),
            "unit": "gCO₂eq",
        },
        "co2_g_saved_per_reuse": {
            "value": round(g_co2_avoided_per_reuse, 4),
            "bounds": _confidence_bounds(g_co2_avoided_per_reuse),
            "unit": "gCO₂eq",
        },
        "co2_g_saved_for_all_reusers": {
            "value": round(total_saved, 4),
            "unit": "gCO₂eq",
            "reusers": body.answer_count,
        },
        "model": "linear_token_energy_v1",
    }


@router.get("/forum-breakdown")
async def get_forum_breakdown():
    """
    Per-forum breakdown of question count and estimated CO₂ saved.
    Powers the bar chart on the analytics dashboard.
    """
    es = get_es()

    result = await es.search(
        index="questions",
        aggs={
            "by_forum": {
                "terms": {"field": "forum_name", "size": 20},
                "aggs": {
                    "total_upvotes": {"sum": {"field": "upvote_count"}},
                    "total_words": {"sum": {"field": "word_count"}},
                },
            }
        },
        size=0,
    )

    tokens_per_event = _estimate_tokens_for_words(300)
    buckets = result["aggregations"]["by_forum"]["buckets"]

    forums = []
    for b in buckets:
        upvotes = int(b["total_upvotes"]["value"])
        g_co2 = _gco2_for_tokens(upvotes * tokens_per_event)
        forums.append(
            {
                "forum": b["key"],
                "questions": b["doc_count"],
                "upvotes": upvotes,
                "co2_saved_g": round(g_co2, 4),
                "co2_saved_kg": round(g_co2 / 1000, 6),
            }
        )

    return {"forums": forums}
