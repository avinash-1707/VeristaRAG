# AWS Architecture — VeritasRAG

Suggested AWS-based production architecture for VeritasRAG. This is a migration target from the current Render + Neon + Upstash deployment — no application code changes are required; only infrastructure and environment variables change.

---

## Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│  AWS  —  Production Architecture                                           │
│                                                                            │
│  ┌──────────────┐     ┌─────────────────────────────────────────────────┐ │
│  │  CloudFront  │────►│  S3 (static assets)  /  Next.js on Amplify or  │ │
│  │  CDN         │     │  App Runner (container)                         │ │
│  └──────┬───────┘     └─────────────────────────────────────────────────┘ │
│         │  HTTPS                                                           │
│         ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Application Load Balancer                                           │ │
│  └────────┬──────────────────────────────┬───────────────────────────── ┘ │
│           │                              │                                 │
│           ▼                              ▼                                 │
│  ┌────────────────────┐     ┌───────────────────────────────────────────┐ │
│  │  ECS (Fargate)     │     │  ECS (Fargate)                            │ │
│  │  Django API        │────►│  FastAPI AI Service  (internal only)      │ │
│  │  Task Definition   │     │  Amazon Bedrock or Google AI via VPC      │ │
│  │  2+ replicas       │     │  Task Definition  1+ replicas             │ │
│  └────────┬───────────┘     └───────────────────────────────────────────┘ │
│           │                                                                │
│           ▼                                                                │
│  ┌────────────────────┐     ┌────────────────────────────────────────────┐│
│  │  ECS (Fargate)     │     │  Amazon ElastiCache (Valkey or Redis)      ││
│  │  Celery Worker     │     │  • Query cache  (1 hr TTL)                 ││
│  │  SQS as broker     │     │  • Stats cache  (5 min TTL)                ││
│  │  (optional alt.)   │     │  • Celery broker (Redis-compatible)        ││
│  └────────────────────┘     └────────────────────────────────────────────┘│
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Amazon RDS (PostgreSQL 16 or 17) + pgvector extension               │ │
│  │  Multi-AZ standby  •  Read replica for stats queries                 │ │
│  │  OR: Amazon Aurora Serverless v2 (PostgreSQL 16, auto-pause)         │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Amazon S3  (document file storage, replaces Cloudinary)             │ │
│  │  Pre-signed URLs for browser-direct upload                           │ │
│  │  SSE-S3 encryption at rest                                           │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Amazon OpenSearch (optional vector store upgrade)                   │ │
│  │  If pgvector hits scale limits:                                      │ │
│  │  • kNN plugin replaces pgvector HNSW queries                        │ │
│  │  • BM25 built-in (same RRF merge strategy)                          │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  Secrets: AWS Secrets Manager  •  Networking: VPC + private subnets       │
│  Observability: CloudWatch Logs + X-Ray tracing                           │
│  CI/CD: GitHub Actions → ECR push → ECS rolling deploy                    │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Service Mapping

| Need | Service |
|---|---|
| Container orchestration | ECS on Fargate (serverless containers) or EKS |
| Next.js frontend | AWS Amplify Hosting or App Runner |
| PostgreSQL + pgvector | RDS PostgreSQL 16 / 17 or Aurora Serverless v2 (PostgreSQL 16) |
| Vector search (at scale) | Amazon OpenSearch with kNN plugin |
| Redis cache + broker | Amazon ElastiCache for Valkey (preferred) or Redis |
| File storage | Amazon S3 + pre-signed upload URLs |
| LLM / embeddings | Amazon Bedrock (Claude / Titan Embeddings) or keep Google AI |
| CDN | Amazon CloudFront |
| Secrets | AWS Secrets Manager |
| Container registry | Amazon ECR |
| Task queue (alt. broker) | Amazon SQS (Celery supports SQS broker) |

---

## Migration Notes

### From Cloudinary → S3

Replace `CLOUDINARY_URL` with `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`. Update `CloudinarySignatureView` in Django to generate S3 pre-signed PUT URLs via `boto3.client('s3').generate_presigned_url`. FastAPI fetches files from S3 via `boto3` instead of the Cloudinary SDK.

### From Neon → RDS / Aurora

`DATABASE_URL` swap only. pgvector is available on RDS PostgreSQL 16 (`CREATE EXTENSION vector`) and Aurora PostgreSQL 15.5+. HNSW and GIN indexes are identical.

### From Upstash → ElastiCache

`REDIS_URL` swap only. ElastiCache is VPC-internal; Celery and Django connect via the private endpoint.

**Note on Redis vs Valkey:** Redis relicensed to SSPL in March 2024. AWS now recommends **ElastiCache for Valkey** (the open-source fork) for new deployments — it is API-compatible with Redis 7.2, so Celery and Django cache backends work without changes. ElastiCache for Redis remains available for existing workloads.

### From Render → ECS Fargate

Each service maps to one ECS Task Definition:

| Current | ECS Task Definition |
|---|---|
| `veritasrag-api` (Render Web Service) | Django API, 2+ replicas behind ALB |
| `veritasrag-ai` (Render Web Service) | FastAPI AI service, VPC-internal service |
| `veritasrag-worker` (Render Background Worker) | Celery worker, no ALB |

Pre-deploy migration hook becomes an ECS one-off task running `python manage.py migrate` before the new task definition rolls out.

### LLM / embeddings on Bedrock (optional)

If you want to stay fully within AWS, replace `google-genai` with `boto3` + Amazon Bedrock:
- Embeddings: `amazon.titan-embed-text-v2` — 1024d (adjust `vector(768)` → `vector(1024)` in schema)
- Generation: `anthropic.claude-3-7-sonnet-20250219-v1:0` (Claude 3.7 Sonnet) via Bedrock — check the Bedrock console for the latest available Claude model ID

No code changes beyond the service clients and the vector dimension.

---

## Cost Estimate (minimal production)

| Service | Config | Est. monthly |
|---|---|---|
| ECS Fargate (Django) | 0.25 vCPU / 512 MB, 1 replica | ~$9 |
| ECS Fargate (FastAPI) | 0.25 vCPU / 512 MB, 1 replica | ~$9 |
| ECS Fargate (Celery) | 0.25 vCPU / 512 MB, 1 replica | ~$9 |
| RDS PostgreSQL | db.t4g.micro, 20 GB gp3 | ~$15 |
| ElastiCache | cache.t4g.micro | ~$12 |
| S3 | 10 GB storage + requests | ~$1 |
| ALB | 1 ALB | ~$16 |
| CloudFront | 1 TB transfer | ~$8 |
| **Total** | | **~$79/mo** |

Aurora Serverless v2 and Fargate Spot can reduce this by ~40%.
