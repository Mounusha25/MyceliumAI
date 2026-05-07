# Mycelium AI — Fetch.ai Agent Network

Five autonomous agents that form the Q&A routing pipeline of Mycelium AI. All inter-agent communication goes through the Fetch.ai Agentverse P2P message bus.

---

## Agents

### Q&A pipeline (agent-to-agent)

| Agent | File | Port | Role |
|---|---|---|---|
| Router | `agent_mycelium_router.py` | 8103 | Entry point. Receives `Question` from stuck agents, routes to Curator, returns `Answer` |
| Curator | `agent_claude_curator.py` | 8106 | Classifies problem as `fast-lane` or `deep-lane`, enriches metadata, forwards to Expert |
| Expert | `agent_expert.py` | 8104 | Generates solution, explanation, and code snippet |
| Stuck example | `agent_stuck_example.py` | 8105 | Demo agent. Uses `LoopDetector` — after 3 failures, posts a `Question` to Router |

### Chat interface (ASI:One)

| Agent | File | Port | Role |
|---|---|---|---|
| Orchestrator | `agent_orchestrator.py` | 8100 | Single entry for ASI:One chat. Routes to Coordinator or to user-connected agents |
| Coordinator | `agent_coordinator.py` | 8101 | LangGraph-based delegation, handles FET payment verification (0.1 FET) |

---

## Message models (`models.py`)

- `Question`: `code`, `error_message`, `language`, `bounty_fet`, `tags`
- `Answer`: `solution`, `explanation`, `code_snippet`

---

## Loop detection (`loop_detector.py`)

`LoopDetector(loop_threshold=3)` maintains a sliding window of `ActionResult` outcomes. When `is_stuck()` returns `True`, the agent posts a `Question` to the Router instead of retrying.

---

## How the Curator works

The Curator sits between Router and Expert. It handles classification, not generation:

1. Router forwards incoming `Question` to Curator.
2. Curator assigns a lane: `fast-lane` (runtime error, unblock quickly) or `deep-lane` (design question, thorough analysis).
3. Curator enriches `tags` and adds a `summary`, then forwards to Expert.
4. Expert responds with different answer depth per lane.
5. Expert returns `Answer` to Curator, which appends `curator_note` metadata before passing back to Router.

If `CLAUDE_TRIAGE_ENABLED=true`, step 2 uses Claude for classification. Otherwise, deterministic keyword heuristics handle it. The Fetch.ai message routing is unchanged either way.

---

## Setup

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `AGENTVERSE_API_KEY` in `.env`. After first run, copy each agent's printed address and set:
- `ROUTER_AGENT_ADDRESS`
- `EXPERT_AGENT_ADDRESS`
- `CURATOR_AGENT_ADDRESS`

---

## Running the Q&A pipeline

```bash
python agent_expert.py &
python agent_claude_curator.py &      # optional but recommended
python agent_mycelium_router.py &
python agent_stuck_example.py         # triggers a test question
```

## Running the ASI:One chat flow

```bash
python agent_coordinator.py &         # set COORDINATOR_AGENT_ADDRESS
python agent_orchestrator.py          # main entry for ASI:One
```

---

## Environment variables

| Variable | Purpose |
|---|---|
| `AGENTVERSE_API_KEY` | Fetch.ai Agentverse registration key |
| `ANTHROPIC_API_KEY` | Claude API key (only needed if `CLAUDE_TRIAGE_ENABLED=true`) |
| `CLAUDE_TRIAGE_ENABLED` | `true` to use Claude for triage, `false` for heuristics |
| `ROUTER_AGENT_ADDRESS` | Agentverse address of the Router agent |
| `EXPERT_AGENT_ADDRESS` | Agentverse address of the Expert agent |
| `CURATOR_AGENT_ADDRESS` | Agentverse address of the Curator agent |
| `FET_USE_TESTNET` | `true` to use Fetch.ai testnet for payments |
| `HACKOVERFLOW_API_URL` | Base URL for the Mycelium AI REST API |
