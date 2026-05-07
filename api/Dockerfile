# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# HackOverflow API — Dockerfile
# Build: docker build -t hackoverflow-api ./api
# Run:   docker run -p 8000:8000 --env-file api/.env hackoverflow-api
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim AS base

# Keeps Python output unbuffered and disables .pyc files
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install only what we need at OS level
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ── Dependencies layer (cached separately from source) ───────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ── Source layer ─────────────────────────────────────────────────────────────
COPY . .

# The port Railway / Render / Fly inject via $PORT; default to 8000
ENV PORT=8000

EXPOSE ${PORT}

# Use shell form so $PORT is expanded at runtime
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
