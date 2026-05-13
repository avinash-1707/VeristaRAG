# VeritasRAG

AI-powered knowledge base assistant. Upload documents (PDF, DOCX, TXT), ask questions, and receive responses grounded exclusively in retrieved source material — every answer cites the exact passage it came from.

**Live demo:** [veritas-rag.vercel.app](https://veritas-rag.vercel.app)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [RAG Pipeline](#rag-pipeline)
6. [Citation Grounding](#citation-grounding)
7. [Caching Strategy](#caching-strategy)
8. [Scalability Design](#scalability-design)
9. [AWS Architecture](docs/aws-architecture.md)
10. [GCP Architecture](docs/gcp-architecture.md)
11. [Local Setup](#local-setup)
12. [API Documentation](#api-documentation)
13. [Deployment](#deployment)
14. [CI/CD](#cicd)
15. [Known Limitations](#known-limitations)

---

## Overview

VeritasRAG is a production-grade RAG (Retrieval-Augmented Generation) system built as a portfolio demonstration. It implements the full pipeline from document upload to grounded, cited answers:

- Users upload documents and receive a grounded, cited answer to any question within 3 seconds of a document reaching `ready` status.
- Every answer includes citation cards showing the exact retrieved chunk text, source document, page number, and similarity score.
- Submitting the same question twice against the same document returns the second response from Redis cache (verifiable via the cache-hit badge in the UI).
- A document with content unrelated to the question returns a response that explicitly says so, with a low-confidence warning shown in the UI.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            BROWSER                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Next.js 16 (App Router)  — Vercel Edge CDN                      │   │
│  │  • Login / Signup pages                                          │   │
│  │  • Dashboard  (stats panel, query log table)                     │   │
│  │  • Documents  (upload dropzone, status cards)                    │   │
│  │  • Chat       (streaming chat window, citation panel)            │   │
│  │                                                                  │   │
│  │  Route Handlers (BFF layer)                                      │   │
│  │    /api/auth/*          ──► forwards to Django auth              │   │
│  │    /api/upload-sig/     ──► gets Cloudinary signature            │   │
│  │    /api/chat/stream/    ──► proxies SSE stream from Django       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │ httpOnly cookie  (JWT never in JS)
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    Django 5 + DRF  — Render Web Service                  │
│                                                                          │
│  Auth                Documents              Chat              Stats      │
│  POST /auth/signup    GET  /documents/       POST /chat/query/  GET /stats│
│  POST /auth/login     POST /documents/       GET  /chat/sessions/         │
│  POST /auth/logout    GET  /documents/{id}/  GET  /chat/sessions/{id}/    │
│  POST /auth/refresh   DELETE /documents/{id}/                             │
│  GET  /auth/me        GET /documents/sig/    SSE proxy ──────────────────►│
│                                                                          │
│  Redis cache-aside (Upstash)                                             │
│  Celery task dispatch → process_document(doc_id)                         │
└──────┬────────────────────────────┬─────────────────────────────────────┘
       │ asyncpg / psycopg2         │ httpx  (internal only)
       │                            ▼
       │              ┌─────────────────────────────────────────────────┐
       │              │  FastAPI  — Render Web Service (internal only)  │
       │              │                                                 │
       │              │  POST /ingest    extract→chunk→embed→pgvector   │
       │              │  POST /query     embed→retrieve→rerank→generate │
       │              │  GET  /health                                   │
       │              │                                                 │
       │              │  RAG pipeline services:                         │
       │              │   extractor.py  (pdfplumber / python-docx)      │
       │              │   chunker.py    (512 tok, 50 overlap, tiktoken) │
       │              │   embedder.py   (text-embedding-004, 768d)      │
       │              │   retriever.py  (ANN + BM25 + RRF)             │
       │              │   reranker.py   (cross-encoder, top-20→top-5)  │
       │              │   generator.py  (gemini-2.5-flash-lite, SSE)   │
       │              └──────────────────────┬──────────────────────────┘
       │                                     │
       ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 PostgreSQL 16 + pgvector  (Neon)                         │
│  USERS  DOCUMENTS  CHUNKS  EMBEDDINGS(768d)                              │
│  CHAT_SESSIONS  MESSAGES  CITATIONS  QUERY_LOGS                          │
│  HNSW cosine index on embeddings  +  GIN FTS index on chunks            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                 Celery Worker  (Render Background Worker)                │
│  process_document task  →  calls FastAPI /ingest                         │
│  updates DOCUMENTS.status: uploaded → processing → ready / failed        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                 Redis  (Upstash)                                          │
│  query:{hash}      1 hr   full RAG response (answer + citations)         │
│  stats:{user_id}   5 min  dashboard counts                               │
│  session:{id}      24 hr  JWT session data                               │
│  Celery broker            ingestion task queue                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                 Cloudinary                                               │
│  Browser uploads directly via signed URL (Django generates signature)   │
│  FastAPI fetches file during ingestion via storage_key                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| UI components | shadcn/ui |
| Frontend state | TanStack Query v5 |
| Auth (tokens) | httpOnly cookies via Next.js Route Handlers — tokens never reach JS |
| Django backend | Django 5.2, Django REST Framework 3.17, SimpleJWT 5.5 |
| AI service | FastAPI 0.136, Python 3.12 |
| Task queue | Celery 5.6 + Redis broker |
| Database | PostgreSQL 16 + pgvector (Neon) |
| Cache + broker | Redis 7 (Upstash) |
| File storage | Cloudinary |
| Embeddings | Google `text-embedding-004` — 768 dimensions |
| LLM | Google `gemini-2.5-flash-lite` (with `gemini-2.0-flash-lite` fallback) |
| Reranker | Cohere reranker via API |
| Containerization | Docker + Docker Compose |
| Frontend deploy | Vercel |
| Backend deploy | Render (two web services + background worker) |
| CI/CD | GitHub Actions |

---

## Database Schema

Eight tables in PostgreSQL. pgvector stores 768-dimension embeddings in a dedicated `EMBEDDINGS` table (decoupled from `CHUNKS` so re-embedding with a new model leaves chunk data untouched).

```sql
-- Users
CREATE TABLE users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email        TEXT UNIQUE NOT NULL,
    password     TEXT NOT NULL,        -- bcrypt hashed by Django
    full_name    TEXT,
    created_at   TIMESTAMPTZ DEFAULT now(),
    last_login   TIMESTAMPTZ,
    is_active    BOOLEAN DEFAULT true
);

-- Documents
CREATE TABLE documents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    filename         TEXT NOT NULL,
    storage_key      TEXT NOT NULL,    -- Cloudinary public_id
    file_type        TEXT NOT NULL,    -- pdf | docx | txt
    status           TEXT NOT NULL DEFAULT 'uploaded',  -- uploaded|processing|ready|failed
    file_size_bytes  BIGINT,
    chunk_count      INTEGER DEFAULT 0,
    uploaded_at      TIMESTAMPTZ DEFAULT now(),
    processed_at     TIMESTAMPTZ
);

-- Chunks (document text segments, 512 tokens with 50-token overlap)
CREATE TABLE chunks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id      UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index      INTEGER NOT NULL,
    content          TEXT NOT NULL,
    token_count      INTEGER,
    page_number      INTEGER,
    section_heading  TEXT,
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- Embeddings (768-dimension vectors; 1-to-1 with chunks)
CREATE TABLE embeddings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id        UUID UNIQUE REFERENCES chunks(id) ON DELETE CASCADE,
    embedding_768   vector(768) NOT NULL,
    model_name      TEXT NOT NULL DEFAULT 'text-embedding-004',
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Chat sessions (scoped to one user, can query multiple documents)
CREATE TABLE chat_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL DEFAULT 'New Chat',
    document_ids  JSONB DEFAULT '[]',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Messages (user + assistant turns within a session)
CREATE TABLE messages (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id       UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role             TEXT NOT NULL,   -- user | assistant
    content          TEXT NOT NULL,
    retrieval_score  FLOAT,
    grounding_score  FLOAT,
    latency_ms       INTEGER,
    cache_hit        BOOLEAN DEFAULT false,
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- Citations (retrieved chunks linked to an assistant message)
CREATE TABLE citations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id       UUID REFERENCES messages(id) ON DELETE CASCADE,
    chunk_id         UUID REFERENCES chunks(id) ON DELETE CASCADE,
    similarity_score FLOAT,
    citation_order   INTEGER
);

-- Query logs (all queries, for observability and admin review)
CREATE TABLE query_logs (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID REFERENCES users(id) ON DELETE CASCADE,
    question_text        TEXT NOT NULL,
    doc_ids              JSONB DEFAULT '[]',
    latency_ms           INTEGER,
    chunk_count          INTEGER,
    top_similarity_score FLOAT,
    grounding_score      FLOAT,
    cache_hit            BOOLEAN DEFAULT false,
    model_used           TEXT,
    low_confidence       BOOLEAN DEFAULT false,
    created_at           TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**

```sql
-- HNSW cosine index for fast ANN vector search
CREATE INDEX ON embeddings USING hnsw (embedding_768 vector_cosine_ops);

-- GIN full-text index for BM25 keyword search
CREATE INDEX ON chunks USING gin(to_tsvector('english', content));

-- Document lookup by user
CREATE INDEX ON documents(user_id);

-- Chunk lookup by document
CREATE INDEX ON chunks(document_id);

-- Message history by session (most recent first)
CREATE INDEX ON messages(session_id, created_at DESC);
```

---

## RAG Pipeline

### Ingestion (async via Celery)

```
User uploads file (browser → Cloudinary direct upload)
       │
       ▼
Django creates DOCUMENTS record  (status: uploaded)
Django dispatches Celery task: process_document(document_id)
       │
       ▼
Celery calls FastAPI POST /ingest
       │
       ▼
extractor.py   — pdfplumber (PDF), python-docx (DOCX), plain read (TXT)
chunker.py     — 512-token sliding window, 50-token overlap (tiktoken)
embedder.py    — text-embedding-004 → 768-dim vectors (Google AI)
asyncpg write  — CHUNKS + EMBEDDINGS rows inserted to PostgreSQL
       │
       ▼
FastAPI returns {chunk_count}
Celery updates DOCUMENTS.status = 'ready', DOCUMENTS.chunk_count
       │  (on error: status = 'failed')
       ▼
Frontend polls GET /api/documents/{id}/ every 3 s until status = 'ready'
```

### Query (synchronous, target < 3 s)

```
User types question
       │
       ▼
Django GET /api/chat/query/
       │
       ├── Redis cache hit?  ──► return cached response (<5 ms)
       │
       └── Cache miss:
             │
             ▼
       FastAPI POST /query
             │
             ▼
       embedder.py    — embed question → 768-dim vector
             │
             ▼
       retriever.py   — pgvector HNSW cosine ANN  top-20
                      + PostgreSQL BM25 FTS        top-20
                      → Reciprocal Rank Fusion merge
             │
             ▼
       reranker.py    — Cohere reranker re-scores merged top-20
                      → selects top-5 chunks
             │
             ▼
       generator.py   — checks grounding score
                        if low → returns "insufficient information" response
                        else  → builds grounding prompt + calls gemini-2.5-flash-lite
                              → streams tokens via SSE
             │
             ▼
       Django proxies SSE stream → Next.js → browser (token by token)
             │
             ▼
       On stream complete:
         Django persists MESSAGES + CITATIONS + QUERY_LOGS
         Django stores full response in Redis (1-hr TTL)
```

---

## Citation Grounding

Every assistant answer is accompanied by citation cards. The system enforces grounding at multiple levels:

1. **Retrieval grounding**: Only chunks from the user's selected documents are retrieved — no cross-user data.

2. **Prompt grounding**: The system prompt instructs the model to answer exclusively from provided excerpts:
   ```
   Answer ONLY using the provided source excerpts below.
   If the answer is not present in the excerpts, state clearly:
   "The provided documents do not contain sufficient information to answer this question."
   Never invent facts, cite sources, or draw on outside knowledge.
   ```

3. **Score-based rejection**: If the top reranker score falls below the low-confidence threshold, the system bypasses generation entirely and returns the "insufficient information" message directly — no LLM call.

4. **Citation cards**: Every answer renders citation cards showing:
   - Exact chunk text (the passage the model read)
   - Source document name
   - Page number
   - Similarity score

5. **Low-confidence warning**: If `grounding_score < 0.6`, a warning banner appears: *"Answer confidence is low — documents may not contain sufficient information."*

6. **Query logging**: Every low-confidence query is flagged `low_confidence = true` in `QUERY_LOGS` for admin review.

---

## Caching Strategy

Cache-aside pattern throughout. Redis (Upstash in production).

| Cache key | TTL | Contents |
|---|---|---|
| `query:{sha256(question + sorted_doc_ids)}` | 1 hour | Full RAG response: answer text, citations array, grounding_score, model_used |
| `stats:{user_id}` | 5 min | Dashboard counts: doc_count, query_count, avg_grounding, cache_hit_rate |
| `session:{session_id}` | 24 hours | JWT session data |
| Celery broker | — | Ingestion task queue |

**How it works:**

```python
# Django QueryView — cache-aside
cache_key = 'query:' + sha256(question + '|' + ','.join(sorted(doc_ids)))
cached = cache.get(cache_key)
if cached:
    return Response({**json.loads(cached), 'cache_hit': True})
# ... call FastAPI, stream, on completion:
cache.set(cache_key, json.dumps(payload), 3600)
```

Cache hits are visible in the UI as a badge on each message and in the query log table.

**Stats cache:**

```python
# Django DashboardStatsView
cache_key = f'stats:{request.user.id}'
cached = cache.get(cache_key)  # returns in <1ms
if not cached:
    stats = compute_from_db()   # aggregation query
    cache.set(cache_key, stats, 300)
```

---

## Scalability Design

### Service separation

Three independently deployable services with well-defined boundaries:

| Service | Responsibility | Scales on |
|---|---|---|
| Django API | Auth, business logic, cache, task dispatch | Request rate |
| FastAPI AI | Embedding, retrieval, reranking, generation | Inference throughput |
| Celery Worker | Async document ingestion | Ingestion queue depth |

FastAPI is intentionally not public-facing. Django is the sole caller. This separation allows AI inference capacity to be scaled independently of web traffic without code changes.

### Async / background processing

Document ingestion runs entirely in a Celery worker. The upload API returns `201 Created` immediately — the user never waits for a multi-second embedding job. The worker queue depth determines backpressure; multiple Celery workers can be added without touching Django or FastAPI.

### Vector retrieval optimization

- **HNSW index** on `embeddings.embedding_768` — sublinear query time, no `lists` parameter to tune. Supports tens of millions of rows.
- **GIN index** on `chunks` content for BM25 full-text search — PostgreSQL native, zero extra infrastructure.
- **Reciprocal Rank Fusion** merges both result sets without requiring score calibration across different ranking systems.
- **Reranker on top-20 only** — the cross-encoder/Cohere reranker never sees the full table; it operates on the pre-filtered top-20 from the hybrid search, keeping latency predictable.

### Database optimization

- `EMBEDDINGS` is decoupled from `CHUNKS` — re-embedding with a new model is an additive operation with no downtime.
- Row-level ownership enforced at every query — `filter(user=request.user)` prevents cross-user data leakage and allows future sharding by `user_id`.
- Query logs are append-only; stats are read from Redis, not computed on every request.

### Caching impact

Repeated queries (same question + same document set) hit Redis in < 5 ms. At steady state for a knowledge base with a small question vocabulary (FAQ-style), cache hit rates can exceed 80%, dramatically reducing LLM API spend and p99 latency.

### Containerization readiness

Every service has a production Dockerfile with multi-stage builds:
- Next.js: `output: 'standalone'` for minimal image size
- Django: gunicorn or uvicorn ASGI
- FastAPI: uvicorn with --workers flag

`docker-compose.yml` starts the full local stack. Each service's Dockerfile is also used directly by Render's container deploy.

### Horizontal scaling path (no code changes needed)

| Bottleneck | Solution |
|---|---|
| Django worker exhaustion | Scale Render web service replicas; or switch from sync gunicorn to async uvicorn (already in Dockerfile) |
| AI inference queue | Add Celery workers for query inference; FastAPI is stateless — multiple replicas behind a load balancer |
| Vector search latency | Increase HNSW `ef_search` or `m` parameters; or migrate to a dedicated vector DB (pgvector handles millions of rows before this is needed) |
| Celery ingestion backlog | Increase `--concurrency` on the worker; or add a second Render Background Worker pointing at the same queue |
| Redis throughput | Upstash scales automatically; or switch to ElastiCache cluster mode |

---

## AWS Architecture

Full architecture diagram, service mapping, migration notes, and cost estimate: **[docs/aws-architecture.md](docs/aws-architecture.md)**

Key services: ECS Fargate (Django + FastAPI + Celery), RDS PostgreSQL 16 + pgvector, ElastiCache Redis, S3, CloudFront, Amazon Bedrock (optional LLM swap), Amazon OpenSearch (optional vector scale-out), AWS Secrets Manager.

---

## GCP Architecture

Full architecture diagram, service mapping, migration notes, and cost estimate: **[docs/gcp-architecture.md](docs/gcp-architecture.md)**

Key services: Cloud Run (Django + FastAPI + Next.js), Cloud SQL / AlloyDB + pgvector, Memorystore Redis, Cloud Storage, Vertex AI (Gemini + embeddings, same SDK), Vertex AI Vector Search (optional scale-out), Secret Manager.

---

## Local Setup

### Prerequisites

- Docker + Docker Compose
- Node.js 22 + pnpm (`npm install -g pnpm`)
- Python 3.12 + uv (`pip install uv`)
- A [Cloudinary](https://cloudinary.com) free account
- A [Google AI Studio](https://aistudio.google.com) API key (free tier)

### 1. Clone

```bash
git clone https://github.com/avinash/VeritasRAG.git
cd VeritasRAG
```

### 2. Environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set CLOUDINARY_URL, INTERNAL_API_KEY, AI_SERVICE_URL=http://localhost:8001

# AI service
cp ai_service/.env.example ai_service/.env
# Edit ai_service/.env — set GOOGLE_API_KEY, CLOUDINARY_URL, INTERNAL_API_KEY (same as backend)

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Default: DJANGO_INTERNAL_URL=http://localhost:8000 — no changes needed for local dev
```

### 3a. Docker Compose (recommended)

```bash
docker-compose up --build
```

This starts: PostgreSQL (with pgvector), Redis, Django API, FastAPI AI service, and Celery worker.

Run migrations after first start:

```bash
docker-compose exec backend python manage.py migrate
```

Frontend runs separately (Vite/Next.js dev server not in Compose — use step 3b for frontend):

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:3000
```

### 3b. Manual (without Docker)

```bash
# Install all dependencies
make install

# Start PostgreSQL and Redis (Docker for just the datastores)
docker-compose up postgres redis -d

# Run Django migrations
make migrate

# Start all three services in parallel
make dev
# Django API → http://localhost:8000
# FastAPI AI  → http://localhost:8001
# Celery worker (background)

# Start frontend
cd frontend && pnpm dev   # http://localhost:3000
```

### Verify setup

```bash
curl http://localhost:8000/api/health/   # {"status":"ok"}
curl http://localhost:8001/health        # {"status":"ok"}
```

Open [http://localhost:3000](http://localhost:3000), sign up, upload a PDF, and ask a question.

---

## API Documentation

All Django endpoints are under `http://localhost:8000/api/`. All responses are `application/json` unless noted. Protected endpoints require `Authorization: Bearer <access_token>`.

---

### Authentication

#### `POST /api/auth/signup/`

Create a new account.

```json
// Request
{ "email": "alice@example.com", "password": "secret123", "full_name": "Alice" }

// Response 201
{
  "user": { "id": "uuid", "email": "...", "full_name": "..." },
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

#### `POST /api/auth/login/`

```json
// Request
{ "email": "alice@example.com", "password": "secret123" }

// Response 200
{ "user": { ... }, "access": "eyJ...", "refresh": "eyJ..." }
// Response 401: { "error": "Invalid credentials" }
```

#### `POST /api/auth/logout/`  *(protected)*

```json
// Request
{ "refresh": "eyJ..." }
// Response 204 No Content
```

#### `POST /api/auth/refresh/`

```json
// Request
{ "refresh": "eyJ..." }
// Response 200
{ "access": "eyJ...", "refresh": "eyJ..." }
```

#### `GET /api/auth/me/`  *(protected)*

```json
// Response 200
{ "id": "uuid", "email": "alice@example.com", "full_name": "Alice" }
```

---

### Documents

#### `GET /api/documents/`  *(protected)*

Returns the authenticated user's documents.

```json
// Response 200
[
  {
    "id": "uuid",
    "filename": "report.pdf",
    "file_type": "pdf",
    "status": "ready",       // uploaded | processing | ready | failed
    "file_size_bytes": 204800,
    "chunk_count": 42,
    "uploaded_at": "2026-05-13T10:00:00Z",
    "processed_at": "2026-05-13T10:00:12Z"
  }
]
```

#### `POST /api/documents/`  *(protected)*

Register a document after it has been uploaded directly to Cloudinary.

```json
// Request
{
  "filename": "report.pdf",
  "storage_key": "veritasrag/user-id/report.pdf",
  "file_type": "pdf",
  "file_size_bytes": 204800
}
// Response 201: DocumentSerializer output (status: "uploaded")
// Celery task dispatched immediately to begin ingestion.
```

#### `GET /api/documents/signature/`  *(protected)*

Get a Cloudinary signed upload URL. The browser uses this to upload directly to Cloudinary.

```json
// Response 200
{
  "signature": "abc123...",
  "timestamp": 1715596800,
  "folder": "veritasrag/user-id",
  "api_key": "...",
  "cloud_name": "..."
}
```

#### `GET /api/documents/{id}/`  *(protected)*

Poll document status.

```json
// Response 200: DocumentSerializer output
// Response 404: { "error": "Not found" }
```

#### `DELETE /api/documents/{id}/`  *(protected)*

Delete document, all chunks, embeddings, and Cloudinary file.

```
// Response 204 No Content
```

#### `POST /api/documents/{id}/retry/`  *(protected)*

Re-trigger ingestion for a failed document.

```
// Response 200: DocumentSerializer output (status reset to "uploaded")
// Response 400 if status is already "ready"
```

---

### Chat

#### `GET /api/chat/sessions/`  *(protected)*

```json
// Response 200
[
  {
    "id": "uuid",
    "title": "Q3 Report Analysis",
    "document_ids": ["uuid1", "uuid2"],
    "created_at": "...",
    "updated_at": "..."
  }
]
```

#### `POST /api/chat/sessions/`  *(protected)*

```json
// Request
{ "title": "My Chat", "document_ids": ["uuid1"] }
// Response 201: ChatSessionSerializer output
```

#### `GET /api/chat/sessions/{session_id}/`  *(protected)*

Returns session metadata + full message history with citations.

```json
// Response 200
{
  "session": { "id": "...", "title": "...", ... },
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "What is the revenue?",
      "created_at": "..."
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Revenue was $4.2M in Q3...",
      "grounding_score": 0.87,
      "latency_ms": 1240,
      "cache_hit": false,
      "citations": [
        {
          "chunk_id": "uuid",
          "document_name": "q3-report.pdf",
          "page_number": 4,
          "similarity_score": 0.91,
          "content": "Total revenue for Q3 was $4.2M..."
        }
      ]
    }
  ]
}
```

#### `DELETE /api/chat/sessions/{session_id}/`  *(protected)*

```
// Response 204 No Content
```

#### `POST /api/chat/query/`  *(protected)*  — SSE stream

Ask a question. Returns `text/event-stream`.

```json
// Request
{
  "question": "What was Q3 revenue?",
  "session_id": "uuid",
  "document_ids": ["uuid1"]
}
```

**Stream events** (newline-delimited SSE):

```
data: {"token": "Revenue"}
data: {"token": " was"}
data: {"token": " $4.2M..."}
...
data: {
  "done": true,
  "answer": "Revenue was $4.2M in Q3...",
  "citations": [
    {
      "chunk_id": "uuid",
      "document_name": "q3-report.pdf",
      "page_number": 4,
      "similarity_score": 0.91,
      "content": "Total revenue for Q3 was $4.2M..."
    }
  ],
  "grounding_score": 0.87,
  "top_similarity_score": 0.91,
  "model_used": "gemini-2.5-flash-lite"
}
```

**Cache hit response** (not a stream):

```json
{
  "answer": "...",
  "citations": [...],
  "grounding_score": 0.87,
  "cache_hit": true,
  "latency_ms": 3
}
```

---

### Stats

#### `GET /api/stats/`  *(protected)*

Served from Redis cache (5-min TTL).

```json
// Response 200
{
  "document_count": 5,
  "query_count": 42,
  "avg_grounding_score": 0.813,
  "cache_hit_rate": 0.286
}
```

#### `GET /api/stats/query-logs/`  *(protected)*

Last 100 query logs for the authenticated user.

```json
// Response 200
[
  {
    "id": "uuid",
    "question": "What was Q3 revenue?",
    "latency_ms": 1240,
    "grounding_score": 0.87,
    "top_similarity_score": 0.91,
    "cache_hit": false,
    "low_confidence": false,
    "model_used": "gemini-2.5-flash-lite",
    "created_at": "2026-05-13T10:05:00Z"
  }
]
```

---

### Health

#### `GET /api/health/`  (Django — public)

```json
{ "status": "ok" }
```

#### `GET /health`  (FastAPI — public)

```json
{ "status": "ok" }
```

---

### FastAPI Internal Endpoints

These are **not publicly accessible**. Every request must include `X-Internal-Key: {INTERNAL_API_KEY}`. Called exclusively by Django.

#### `POST /ingest`

```json
// Request
{
  "document_id": "uuid",
  "storage_key": "veritasrag/user-id/report.pdf",
  "file_type": "pdf"
}
// Response 200
{ "chunk_count": 42 }
```

#### `POST /query`

```json
// Request
{
  "question": "What was Q3 revenue?",
  "document_ids": ["uuid1"],
  "session_id": "uuid",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
// Response: text/event-stream (same SSE format as above)
```

---

## Deployment

### Production infrastructure

| Service | Platform | URL |
|---|---|---|
| Frontend (Next.js) | Vercel | `veritas-rag.vercel.app` |
| Django API | Render Web Service | `veritasrag-api.onrender.com` |
| FastAPI AI | Render Web Service | `veritasrag-ai.onrender.com` |
| Celery Worker | Render Background Worker | — |
| PostgreSQL | Neon | Serverless PostgreSQL |
| Redis | Upstash | Serverless Redis |
| File storage | Cloudinary | CDN delivery |

### Deploy to Render

All Render services are declared in `render.yaml` (infrastructure as code). On first deploy:

1. Import `render.yaml` in the Render dashboard or use `render deploy --yaml render.yaml`.
2. Set the required environment variables marked `sync: false` in the Render dashboard:
   - `REDIS_URL` — Upstash Redis URL
   - `ALLOWED_HOSTS` — your Render service hostname
   - `CORS_ALLOWED_ORIGINS` — your Vercel frontend URL
   - `CLOUDINARY_URL` — `cloudinary://api_key:api_secret@cloud_name`
   - `AI_SERVICE_URL` — internal URL of the FastAPI service
   - `INTERNAL_API_KEY` — random secret (same value in both Django and FastAPI services)
   - `GOOGLE_API_KEY` — Google AI Studio key (FastAPI service only)

3. The `veritasrag-api` service runs `python manage.py migrate` as its pre-deploy command.

### Deploy frontend to Vercel

```bash
cd frontend
# First time
vercel --prod

# Set environment variable in Vercel dashboard:
# DJANGO_INTERNAL_URL = https://veritasrag-api.onrender.com
```

---

## CI/CD

GitHub Actions workflow at `.github/workflows/deploy.yml`:

```
Push to main
    │
    ├── Django Tests        — pytest against real PostgreSQL + Redis
    ├── FastAPI Tests        — pytest-asyncio
    └── Next.js Build        — pnpm build (type check + build)
    │
    └── (all pass) → Render deploy hooks
          ├── Deploy Django API
          ├── Deploy FastAPI AI
          └── Deploy Celery Worker
```

**Required GitHub secrets:**

| Secret | Value |
|---|---|
| `RENDER_DEPLOY_HOOK_API` | Render deploy hook URL for Django service |
| `RENDER_DEPLOY_HOOK_AI` | Render deploy hook URL for FastAPI service |
| `RENDER_DEPLOY_HOOK_WORKER` | Render deploy hook URL for Celery worker |

---

## Known Limitations

- **Render free tier cold starts (~30 s)**: A keep-alive component in the Next.js frontend pings `/api/auth/me` every 4 minutes to warm up the Django and FastAPI Render services before the user interacts.
- **Render free tier RAM (512 MB)**: The FastAPI service loads the reranker on startup. Cohere reranker uses the API (no local model load) to keep RAM usage below the 512 MB limit.
- **Neon free tier (0.5 GB)**: Sufficient for a demo (`768d × 4 bytes × 10,000 chunks ≈ 30 MB`). Production workloads should upgrade to Neon Pro or RDS.
- **Single Celery worker**: The free Render Background Worker runs one instance. For production ingestion throughput, increase `--concurrency` or add more workers.
- **No document versioning**: Re-uploading the same file creates a new document. Old chunks remain until the original document is deleted.
