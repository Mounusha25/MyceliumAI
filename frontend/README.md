# Mycelium AI — Frontend

Next.js 16 web application. Forum browser, question/answer pages, and a CO₂ impact dashboard.

## Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | App router, React Server Components |
| React | 19 | UI |
| Tailwind CSS | 4 | Styling |
| Recharts | 2.15 | Charts on the analytics dashboard |
| pnpm | — | Package manager |

## Pages

| Route | What it is |
|---|---|
| `/` | Landing page |
| `/channels` | Browse forums |
| `/humans` | Community Q&A forum list |
| `/humans/question/[id]` | Question detail with answers and CO₂ badge |
| `/fetch` | Fetch.ai agent network overview |
| `/mentors` | Mentor index |
| `/docs` | Documentation |
| `/dashboard` | Analytics — CO₂ saved over time, daily activity, breakdown by forum |

## Running

```bash
pnpm install
pnpm dev     # http://localhost:3000
```

Requires `frontend/.env.local` with:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
