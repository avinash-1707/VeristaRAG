# GCP Architecture — VeritasRAG

Suggested GCP-based alternative architecture for VeritasRAG. This is a migration target from the current Render + Neon + Upstash deployment — no application code changes are required; only infrastructure and environment variables change.

---

## Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│  GCP  —  Alternative Architecture                                          │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  Cloud CDN  +  Cloud Load Balancing                                │   │
│  └──────────────────────────┬─────────────────────────────────────────┘   │
│                             │                                              │
│                             ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  Cloud Run  (Next.js)   — auto-scales to zero, no cold start tax   │   │
│  └──────────────────────────────────────────────────────────────────── ┘   │
│                                                                            │
│  ┌──────────────────────────┐   ┌────────────────────────────────────┐    │
│  │  Cloud Run               │   │  Cloud Run                         │    │
│  │  Django API              │──►│  FastAPI AI Service  (internal)    │    │
│  │  min-instances: 1        │   │  Vertex AI  Embeddings + Gemini    │    │
│  └──────────────────────────┘   └────────────────────────────────────┘    │
│                                                                            │
│  ┌──────────────────────────┐                                             │
│  │  Cloud Run Jobs          │   (replaces Celery + worker)                │
│  │  OR GKE Autopilot pod    │   trigger on Pub/Sub message                │
│  │  Celery worker           │                                             │
│  └──────────────────────────┘                                             │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Cloud SQL (PostgreSQL 16)  +  pgvector extension                    │ │
│  │  HA configuration  •  read replica for analytics                    │ │
│  │  OR:  AlloyDB (PostgreSQL-compatible, better vector performance)     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Memorystore for Redis (managed Redis 7)                             │ │
│  │  • Query cache, stats cache, Celery broker                          │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Cloud Storage  (replaces Cloudinary)                                │ │
│  │  Signed upload URLs for browser-direct upload                       │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Vertex AI Vector Search  (optional scale-out)                       │ │
│  │  If pgvector hits limits: Vertex AI manages the HNSW index          │ │
│  │  Supports billions of vectors, fully managed                        │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  Secrets: Secret Manager  •  Networking: VPC + VPC Connector               │
│  Observability: Cloud Logging + Cloud Trace                                │
│  CI/CD: GitHub Actions → Artifact Registry → Cloud Run deploy             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Service Mapping

| Need | Service |
|---|---|
| Container runtime | Cloud Run (serverless) or GKE Autopilot |
| Next.js frontend | Cloud Run or Firebase Hosting |
| PostgreSQL + pgvector | Cloud SQL for PostgreSQL 16 or AlloyDB |
| Vector search (at scale) | Vertex AI Vector Search |
| Redis cache + broker | Memorystore for Redis |
| File storage | Cloud Storage + signed upload URLs |
| LLM / embeddings | Vertex AI (Gemini + text-embedding) — same API, different endpoint |
| CDN | Cloud CDN + Cloud Load Balancing |
| Secrets | Secret Manager |
| Container registry | Artifact Registry |
| Async tasks | Cloud Run Jobs or Pub/Sub + Cloud Run trigger |

---

## Migration Notes

### From Cloudinary → Cloud Storage

Replace `CLOUDINARY_URL` with `GCS_BUCKET_NAME` + Application Default Credentials (Workload Identity on Cloud Run). Update `CloudinarySignatureView` in Django to generate GCS signed upload URLs via `google.cloud.storage.Blob.generate_signed_url`. FastAPI fetches files from GCS via `google.cloud.storage` instead of the Cloudinary SDK.

### From Neon → Cloud SQL / AlloyDB

`DATABASE_URL` swap only. Cloud SQL for PostgreSQL 16 supports pgvector via `CREATE EXTENSION vector`. AlloyDB is recommended for high-throughput vector workloads — it includes built-in vector similarity operators with better index performance than vanilla pgvector.

### From Upstash → Memorystore

`REDIS_URL` swap only. Memorystore Redis is VPC-internal; connect via the internal IP. Use VPC Connector on Cloud Run to reach Memorystore.

### From Render → Cloud Run

Each service maps to one Cloud Run service:

| Current | Cloud Run Service |
|---|---|
| `veritasrag-api` (Render Web Service) | Django API, `min-instances: 1`, public |
| `veritasrag-ai` (Render Web Service) | FastAPI AI service, VPC-internal (no public ingress) |
| `veritasrag-worker` (Render Background Worker) | Cloud Run Job triggered by Pub/Sub, or GKE Autopilot pod |

Pre-deploy migration hook becomes a Cloud Run Job running `python manage.py migrate` in the CI/CD pipeline before the new revision is promoted.

### Celery → Cloud Run Jobs + Pub/Sub (optional)

For a serverless-native approach, replace Celery entirely:
1. Django publishes a Pub/Sub message instead of `process_document.delay()`
2. A Pub/Sub push subscription triggers a Cloud Run Job per message
3. The Job runs the same FastAPI `/ingest` call

This eliminates the always-on worker cost and gives per-job scaling.

### LLM / embeddings already on Vertex AI

The current stack uses `google-genai` with `text-embedding-004` and `gemini-2.5-flash-lite`. On GCP, the same models are available via the Vertex AI endpoint — change `GOOGLE_GENAI_USE_VERTEXAI=1` and set `GOOGLE_CLOUD_PROJECT` / `GOOGLE_CLOUD_LOCATION`. No SDK changes.

### Vertex AI Vector Search (scale-out path)

When pgvector HNSW query latency exceeds SLA (typically > 50 million vectors):
1. Batch-export embeddings from PostgreSQL to Cloud Storage as JSON Lines
2. Create a Vertex AI Vector Search index from the export
3. Replace `retriever.py` ANN query with `aiplatform.MatchingEngineIndexEndpoint.match()`
4. Keep the BM25 + RRF merge — Cloud SQL FTS is unchanged

---

## Cost Estimate (minimal production)

| Service | Config | Est. monthly |
|---|---|---|
| Cloud Run (Django) | 1 vCPU / 512 MB, min-instances: 1 | ~$10 |
| Cloud Run (FastAPI) | 1 vCPU / 512 MB, min-instances: 1 | ~$10 |
| Cloud Run (Celery / Jobs) | per-use | ~$2 |
| Cloud SQL PostgreSQL | db-g1-small, 20 GB SSD | ~$18 |
| Memorystore Redis | basic, 1 GB | ~$16 |
| Cloud Storage | 10 GB + operations | ~$1 |
| Cloud CDN + LB | 1 TB transfer | ~$10 |
| **Total** | | **~$67/mo** |

Cloud Run scales to zero outside business hours; actual cost for a demo workload will be significantly lower.
