import {
  BookOpen,
  CheckCircle2,
  MessageSquare,
  Search,
  Shield,
  Upload,
  Zap,
} from 'lucide-react'

export type Particle = {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export const EASE_EXPO = [0.19, 1, 0.22, 1] as const

export const PARTICLES: Particle[] = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i * 41 + 17) % 100,
  y: (i * 29 + 11) % 100,
  size: (i % 3) + 1,
  duration: 3.5 + (i % 5),
  delay: (i * 0.27) % 5,
  opacity: 0.05 + (i % 5) * 0.025,
}))

export const FEATURES = [
  {
    icon: Search,
    title: 'Hybrid Retrieval',
    desc: 'pgvector HNSW cosine ANN + BM25 full-text fused via reciprocal rank fusion. Maximum precision at every query.',
    metric: '20→5',
    metricLabel: 'candidates reranked',
  },
  {
    icon: Shield,
    title: 'Grounded Answers',
    desc: 'Every response is anchored to exact source passages. A grounding score (0–1) flags low-confidence answers automatically.',
    metric: '0.94',
    metricLabel: 'avg similarity score',
  },
  {
    icon: Zap,
    title: 'Sub-3s Responses',
    desc: 'Repeated queries resolve from Redis cache in under 5ms. Cold RAG completes end-to-end in under 3 seconds.',
    metric: '< 5ms',
    metricLabel: 'cache hit latency',
  },
  {
    icon: BookOpen,
    title: 'Exact Citations',
    desc: 'Chunk text, source document, page number, similarity score — every answer fully traceable back to the source.',
    metric: '100%',
    metricLabel: 'answers cited',
  },
]

export const STEPS = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Docs',
    desc: 'PDF, DOCX, or TXT. Direct Cloudinary upload. Async ingestion via Celery — the UI never blocks while your document processes.',
  },
  {
    icon: MessageSquare,
    step: '02',
    title: 'Ask in Plain Language',
    desc: 'Type any question about your documents. Hybrid search finds the most relevant passages across all selected files instantly.',
  },
  {
    icon: CheckCircle2,
    step: '03',
    title: 'Get Cited Answers',
    desc: 'Grounded answers with exact citations: document, page, chunk, similarity score. Low confidence? A warning tells you.',
  },
]

export const FAQ_ITEMS = [
  {
    q: 'How does VeritasRAG prevent hallucinations?',
    a: 'Every answer is grounded exclusively in retrieved document passages. If no relevant passage is found (similarity < 0.75), the system explicitly says so. A grounding score (0–1) accompanies every response, and a warning banner appears for scores below 0.6.',
  },
  {
    q: 'What file formats are supported?',
    a: 'PDF, DOCX, and TXT files up to 50MB each. Documents are extracted, chunked into 512-token windows with 50-token overlap, embedded with Google text-embedding-004, and stored in pgvector — all asynchronously via Celery.',
  },
  {
    q: 'How fast are responses?',
    a: 'Cold RAG queries complete in under 3 seconds end-to-end. Repeated queries on the same question and document set resolve from Redis cache in under 5ms.',
  },
  {
    q: 'Is my data secure?',
    a: 'Files are stored on Cloudinary with signed URLs. All API routes are JWT-protected via httpOnly cookies. No document content is stored in the browser or passed through localStorage.',
  },
  {
    q: 'Can I query across multiple documents?',
    a: 'Yes. Chat sessions can be scoped to one or more documents. The hybrid retrieval pipeline searches across all selected documents and ranks passages by relevance using reciprocal rank fusion.',
  },
]

export const TECH = [
  'Gemini 2.0 Flash',
  'pgvector HNSW',
  'BM25 Full-text',
  'Cross-encoder Reranking',
  'Redis Cache',
  'Celery Async',
  'Next.js 16',
  'Django 5',
  'FastAPI',
]
