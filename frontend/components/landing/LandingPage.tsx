'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  Zap,
  Sparkles,
  FileText,
  Upload,
  Search,
  ArrowRight,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Star,
  Menu,
  X,
  BarChart3,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Particle = {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE_EXPO = [0.19, 1, 0.22, 1] as const

const NAV_LINKS = [
  { label: 'Features', id: 'features' },
  { label: 'Process', id: 'process' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'FAQ', id: 'faq' },
]

const FEATURES = [
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

const STEPS = [
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

const TESTIMONIALS = [
  {
    name: 'James L.',
    role: 'PhD Researcher · Stanford',
    initial: 'J',
    quote:
      'VeritasRAG changed how I work with research papers. I upload 30 PDFs and ask cross-document questions in seconds — with exact page citations every time.',
    rating: 5,
  },
  {
    name: 'Michael R.',
    role: 'Product Manager · Series B',
    initial: 'M',
    quote:
      "I needed to extract insights from 200-page compliance reports. VeritasRAG gives me direct, grounded answers with the exact passage highlighted. It's genuinely magic.",
    rating: 5,
  },
  {
    name: 'Emily S.',
    role: 'Legal Analyst · Corporate Law',
    initial: 'E',
    quote:
      'The citation feature is what sold me. I can see exactly which contract clause every answer comes from. The confidence score tells me when to dig deeper.',
    rating: 5,
  },
]

const PRICING = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Perfect for exploring document Q&A with no commitment.',
    features: ['5 documents', '50 queries / month', 'PDF, DOCX, TXT', 'Citation panel', '7-day history'],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    desc: 'For researchers and professionals who live in documents.',
    features: ['Unlimited documents', 'Unlimited queries', 'Priority pipeline', 'Full history', 'Cache analytics', 'API access'],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$99',
    period: '/mo',
    desc: 'For teams that need shared document knowledge.',
    features: ['Everything in Pro', 'Up to 10 users', 'Shared library', 'Admin analytics', 'SSO ready', 'Priority support'],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

const FAQ_ITEMS = [
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

const TECH = [
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

// ─── Shared helpers ────────────────────────────────────────────────────────────

function PillLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4"
      style={{ border: '1px solid var(--border-accent)', background: 'var(--accent-subtle)' }}
    >
      <span
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: 'var(--accent-bright)' }}
      >
        {children}
      </span>
    </div>
  )
}

function IconBadge3D({
  icon: Icon,
  size = 52,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  size?: number
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: 'linear-gradient(145deg, rgba(212,88,10,0.88) 0%, rgba(15,10,4,1) 80%)',
        boxShadow: [
          '0 0 0 1px rgba(255,255,255,0.12) inset',
          '0 -1px 0 rgba(0,0,0,0.6) inset',
          '0 1px 0 rgba(255,255,255,0.08) inset',
          '0 8px 24px rgba(212,88,10,0.45)',
          '0 0 40px 4px rgba(212,88,10,0.12)',
        ].join(', '),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon
        className="text-white"
        style={{
          width: size * 0.38,
          height: size * 0.38,
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
        }}
      />
    </div>
  )
}

// ─── Feature Card ──────────────────────────────────────────────────────────────

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, duration: 0.65, ease: EASE_EXPO }}
      className="group relative overflow-hidden cursor-default"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 24,
        padding: '28px',
        transition: 'border-color 300ms, box-shadow 300ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-accent)'
        e.currentTarget.style.boxShadow = '0 0 48px 8px var(--glow-soft)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Permanent orange glow from bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 110%, rgba(212,88,10,0.18) 0%, transparent 65%)',
          borderRadius: 24,
        }}
      />
      {/* Hover intensified glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(212,88,10,0.30) 0%, transparent 65%)',
          borderRadius: 24,
        }}
      />

      <div className="relative">
        {/* 3D icon */}
        <div className="mb-5">
          <IconBadge3D icon={feature.icon} />
        </div>

        <h3
          className="text-base font-semibold mb-2 tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {feature.title}
        </h3>
        <p
          className="text-sm leading-relaxed mb-5"
          style={{ color: 'var(--text-secondary)' }}
        >
          {feature.desc}
        </p>

        {/* Metric badge */}
        <div
          className="inline-flex flex-col"
          style={{
            background: 'var(--bg-card-inner)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '10px 14px',
          }}
        >
          <span
            className="text-xl font-bold font-mono leading-tight"
            style={{ color: 'var(--accent-bright)' }}
          >
            {feature.metric}
          </span>
          <span
            className="text-[10px] uppercase tracking-wider mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {feature.metricLabel}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Chat Mockup ───────────────────────────────────────────────────────────────

function ChatMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: -12 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: 0.45, duration: 1, ease: EASE_EXPO }}
      style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Outer glow orb */}
        <div
          className="absolute -inset-8 rounded-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(212,88,10,0.14) 0%, transparent 70%)',
            filter: 'blur(16px)',
          }}
        />

        {/* Card */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 20,
            boxShadow:
              '0 8px 80px 20px var(--glow-soft), 0 0 0 1px var(--border-accent)',
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              borderBottom: '1px solid var(--border-default)',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] opacity-60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] opacity-60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] opacity-60" />
            </div>
            <div className="flex-1 flex items-center gap-1.5 ml-2">
              <FileText className="h-3 w-3" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                research-paper.pdf
              </span>
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'var(--state-success-subtle)',
                color: 'var(--state-success)',
                border: '1px solid rgba(34,197,94,0.2)',
              }}
            >
              Ready
            </span>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 min-w-[280px] max-w-[340px]">
            {/* User bubble */}
            <div className="flex justify-end">
              <div
                className="rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[82%]"
                style={{
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--border-accent)',
                }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  What methodology was used?
                </p>
              </div>
            </div>

            {/* AI bubble */}
            <div className="flex justify-start">
              <div
                className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[88%]"
                style={{
                  background: 'var(--bg-card-inner)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  The study employed a mixed-methods approach combining quantitative analysis with
                  qualitative interviews across three cohorts
                  <motion.span
                    className="inline-block w-[2px] h-3 ml-0.5 align-text-bottom rounded-full"
                    style={{ background: 'var(--accent-primary)' }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                </p>
              </div>
            </div>

            {/* Sources */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                <span
                  className="text-[10px] uppercase tracking-wider font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Sources
                </span>
              </div>

              {[
                { page: 'p.4', score: '0.94', text: '"The methodology employed a mixed-methods approach, combining quantitative data..."', delay: 1.8 },
                { page: 'p.7', score: '0.87', text: '"Qualitative interviews were conducted with 45 participants across..."', delay: 2.1 },
              ].map((c) => (
                <motion.div
                  key={c.page}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: c.delay, duration: 0.5 }}
                  className="mb-1.5 last:mb-0 rounded-xl p-2.5"
                  style={{
                    background: 'var(--bg-card-inner)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      research-paper.pdf · {c.page}
                    </span>
                    <span
                      className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        color: 'var(--accent-primary)',
                        background: 'var(--accent-subtle)',
                      }}
                    >
                      {c.score}
                    </span>
                  </div>
                  <p
                    className="text-[10px] font-mono leading-relaxed line-clamp-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {c.text}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Grounding score */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Grounding confidence
                </span>
                <span
                  className="text-[10px] font-mono font-semibold"
                  style={{ color: 'var(--state-success)' }}
                >
                  0.91
                </span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{
                  background: 'var(--bg-card-inner)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #d4580a 0%, #22c55e 100%)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: '91%' }}
                  transition={{ delay: 2.6, duration: 1, ease: EASE_EXPO }}
                />
              </div>
            </motion.div>
          </div>

          {/* Input bar */}
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{
              borderTop: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
            }}
          >
            <div
              className="flex-1 h-8 rounded-lg px-3 flex items-center"
              style={{
                background: 'var(--bg-card-inner)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Ask another question...
              </span>
            </div>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #d4580a, #b84208)',
                boxShadow: '0 0 12px 4px rgba(212,88,10,0.5)',
              }}
            >
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── FAQ Item ──────────────────────────────────────────────────────────────────

function FAQItem({
  item,
  index,
}: {
  item: (typeof FAQ_ITEMS)[0]
  index: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: EASE_EXPO }}
      style={{
        borderRadius: 16,
        border: `1px solid ${open ? 'var(--border-accent)' : 'var(--border-default)'}`,
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        transition: 'border-color 200ms',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span
          className="text-sm font-medium pr-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-5">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, -80])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: (i * 41 + 17) % 100,
        y: (i * 29 + 11) % 100,
        size: (i % 3) + 1,
        duration: 3.5 + (i % 5),
        delay: (i * 0.27) % 5,
        opacity: 0.05 + (i % 5) * 0.025,
      }))
    )
  }, [])

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ─── NAVBAR ─────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-3.5"
        style={{
          background: 'rgba(13,10,8,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #d4580a, #b84208)',
              boxShadow: '0 0 16px 4px rgba(212,88,10,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            VeritasRAG
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-xs font-medium transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-xs font-medium transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-xs font-semibold text-white px-5 py-2.5 rounded-full transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #d4580a, #b84208)',
              boxShadow: '0 0 20px 4px rgba(212,88,10,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            Get Started
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[57px] left-0 right-0 z-40 md:hidden"
            style={{
              background: 'rgba(13,10,8,0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border-default)',
              padding: '16px 24px',
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileNavOpen(false)}
                className="block py-3 text-sm font-medium"
                style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)' }}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 flex gap-3">
              <Link
                href="/login"
                onClick={() => setMobileNavOpen(false)}
                className="flex-1 text-center text-sm py-2.5 rounded-full"
                style={{ border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileNavOpen(false)}
                className="flex-1 text-center text-sm font-semibold text-white py-2.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #d4580a, #b84208)' }}
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO ───────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 px-6 md:px-12 overflow-hidden">
        {/* Dramatic orange horizon glow — the defining visual */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 85% 58% at 50% 100%, rgba(212,88,10,0.48) 0%, rgba(138,58,6,0.16) 48%, transparent 68%)',
          }}
        />
        {/* Bright bloom layer */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '55%',
            height: '42%',
            background:
              'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(232,117,26,0.58) 0%, rgba(212,88,10,0.16) 42%, transparent 65%)',
            filter: 'blur(32px)',
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(212,88,10,0.13) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: '#d4580a',
              opacity: p.opacity,
            }}
            animate={{ y: [0, -22, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}

        {/* Hero content */}
        <div className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          {/* Left copy */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }}>
            {/* Announcement pill with pulsing dot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
              style={{ border: '1px solid var(--border-accent)', background: 'var(--accent-subtle)' }}
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ background: 'var(--accent-bright)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: 'var(--accent-primary)' }}
                />
              </span>
              <span
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--accent-bright)' }}
              >
                Hybrid RAG · Gemini 2.0 · pgvector
              </span>
            </motion.div>

            {/* Heading */}
            <div className="mb-6">
              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, ease: EASE_EXPO }}
                  className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.02]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No guessing.
                </motion.p>
              </div>
              <div className="overflow-hidden mt-[0.04em]">
                <motion.p
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1, duration: 0.9, ease: EASE_EXPO }}
                  className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.02]"
                  style={{
                    background: 'linear-gradient(120deg, #f0905a 0%, #e8751a 25%, #d4580a 55%, #b84208 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  No hallucination.
                </motion.p>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.65, ease: EASE_EXPO }}
              className="text-lg leading-relaxed max-w-[26rem] mb-9"
              style={{ color: 'var(--text-secondary)' }}
            >
              Upload documents, ask questions, and get answers{' '}
              <span style={{ color: 'var(--text-primary)' }}>grounded in your actual content</span> — with
              exact citations showing document, page, and passage.
            </motion.p>

            {/* CTA buttons — pill-shaped */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease: EASE_EXPO }}
              className="flex flex-wrap gap-3 mb-8"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white px-7 py-3.5 rounded-full transition-all duration-150"
                style={{
                  background: 'linear-gradient(135deg, #d4580a, #b84208)',
                  boxShadow: '0 0 28px 8px rgba(212,88,10,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-sm px-7 py-3.5 rounded-full transition-all duration-150"
                style={{ color: 'var(--text-primary)', border: '1px solid var(--border-strong)' }}
              >
                See Features
                <ChevronRight className="h-4 w-4" />
              </a>
            </motion.div>

            {/* Trust chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap items-center gap-5"
            >
              {['Zero hallucination', 'Exact citations', '< 3s response'].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <CheckCircle2
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: 'var(--state-success)' }}
                  />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: chat mockup */}
          <div className="flex justify-center lg:justify-end">
            <ChatMockup />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-4 h-6 rounded-full flex items-start justify-center pt-1"
            style={{ border: '1px solid var(--border-strong)' }}
          >
            <div
              className="w-1 h-1.5 rounded-full"
              style={{ background: 'var(--accent-primary)' }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── TECH BAR ───────────────────────────────── */}
      <section
        className="py-7 overflow-hidden"
        style={{
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
        }}
      >
        <div className="flex items-center justify-center flex-wrap gap-2.5 px-6 md:px-12">
          <span
            className="text-xs uppercase tracking-widest mr-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Powered by
          </span>
          {TECH.map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
              }}
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────── */}
      <section id="features" className="py-28 px-6 md:px-12 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,88,10,0.04) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE_EXPO }}
            className="text-center mb-16"
          >
            <PillLabel>Why VeritasRAG</PillLabel>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Why users stick with it.
            </h2>
            <p
              className="text-sm leading-relaxed max-w-lg mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Every layer is engineered to maximize retrieval quality and response grounding. Zero hallucination
              is a design constraint, not a goal.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESS ────────────────────────────────── */}
      <section
        id="process"
        className="py-28 px-6 md:px-12 relative overflow-hidden"
        style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(212,88,10,0.05) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE_EXPO }}
            className="text-center mb-16"
          >
            <PillLabel>Process</PillLabel>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              The Process. Fast, Clear, Done.
            </h2>
            <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              No manual work. No waiting. Just answers grounded in your content.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: EASE_EXPO }}
                className="relative overflow-hidden"
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 24,
                  padding: '28px 24px',
                }}
              >
                {/* Per-card orange bottom glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(212,88,10,0.14) 0%, transparent 65%)',
                    borderRadius: 24,
                  }}
                />

                <div className="relative">
                  {/* Icon + step number */}
                  <div className="flex items-start gap-3 mb-5">
                    <IconBadge3D icon={step.icon} />
                    <span
                      className="text-3xl font-bold font-mono tracking-tight mt-1"
                      style={{ color: 'var(--border-strong)' }}
                    >
                      {step.step}
                    </span>
                  </div>

                  <h3
                    className="text-base font-semibold mb-2 tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────── */}
      <section id="testimonials" className="py-28 px-6 md:px-12 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(212,88,10,0.04) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE_EXPO }}
            className="text-center mb-16"
          >
            <PillLabel>Testimonials</PillLabel>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              What users are saying.
            </h2>
            <p
              className="text-sm max-w-sm mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Researchers, analysts, and professionals getting grounded answers from their docs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.1, duration: 0.65, ease: EASE_EXPO }}
                className="group relative overflow-hidden"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 24,
                  padding: '28px',
                  transition: 'border-color 300ms, box-shadow 300ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)'
                  e.currentTarget.style.boxShadow = '0 0 40px 6px var(--glow-soft)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Bottom glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse 70% 55% at 50% 110%, rgba(212,88,10,0.12) 0%, transparent 65%)',
                    borderRadius: 24,
                  }}
                />

                <div className="relative">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-3.5 w-3.5 fill-current"
                        style={{ color: 'var(--accent-primary)' }}
                      />
                    ))}
                  </div>

                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(212,88,10,0.65), rgba(10,8,4,0.95))',
                        border: '1px solid var(--border-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span className="text-xs font-bold text-white">{t.initial}</span>
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {t.name}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────── */}
      <section
        id="pricing"
        className="py-28 px-6 md:px-12 relative overflow-hidden"
        style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(212,88,10,0.05) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE_EXPO }}
            className="text-center mb-16"
          >
            <PillLabel>Pricing</PillLabel>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Straightforward pricing that fits.
            </h2>
            <p
              className="text-sm max-w-md mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Whether you&apos;re exploring RAG for the first time or scaling your knowledge infrastructure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.1, duration: 0.65, ease: EASE_EXPO }}
                className="relative overflow-hidden"
                style={{
                  background: plan.highlighted ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: plan.highlighted
                    ? '1px solid var(--border-accent)'
                    : '1px solid var(--border-default)',
                  borderRadius: 24,
                  padding: '28px',
                  boxShadow: plan.highlighted
                    ? '0 0 60px 10px var(--glow-soft)'
                    : 'none',
                }}
              >
                {plan.highlighted && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(ellipse 80% 55% at 50% 110%, rgba(212,88,10,0.22) 0%, transparent 65%)',
                      borderRadius: 24,
                    }}
                  />
                )}

                {plan.highlighted && (
                  <div
                    className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: 'var(--accent-subtle)',
                      border: '1px solid var(--border-accent)',
                      color: 'var(--accent-bright)',
                    }}
                  >
                    Popular
                  </div>
                )}

                <div className="relative">
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {plan.name} Plan
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs leading-relaxed mb-6"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {plan.desc}
                  </p>

                  <Link
                    href="/signup"
                    className="block w-full text-center text-sm font-semibold py-3 rounded-full mb-6 transition-all duration-150"
                    style={
                      plan.highlighted
                        ? {
                            background: 'linear-gradient(135deg, #d4580a, #b84208)',
                            color: 'white',
                            boxShadow:
                              '0 0 20px 6px rgba(212,88,10,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
                          }
                        : {
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-strong)',
                          }
                    }
                  >
                    {plan.cta}
                  </Link>

                  <div className="space-y-2.5">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <CheckCircle2
                          className="h-3.5 w-3.5 flex-shrink-0"
                          style={{
                            color: plan.highlighted
                              ? 'var(--accent-primary)'
                              : 'var(--state-success)',
                          }}
                        />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────── */}
      <section
        id="faq"
        className="py-28 px-6 md:px-12"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE_EXPO }}
            className="text-center mb-14"
          >
            <PillLabel>FAQ</PillLabel>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Questions? We&apos;ve got answers.
            </h2>
            <p
              className="text-sm max-w-sm mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              We&apos;ve answered the most common questions below. If you need more, just ask.
            </p>
          </motion.div>

          <div className="space-y-2.5">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={item.q} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────── */}
      <section
        className="relative py-36 px-6 md:px-12 overflow-hidden"
        style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
      >
        {/* Strong centered glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 50% 100%, rgba(212,88,10,0.38) 0%, rgba(138,58,6,0.12) 52%, transparent 70%)',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-none"
          style={{
            width: '48%',
            height: '50%',
            background:
              'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(232,117,26,0.52) 0%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: EASE_EXPO }}
          className="relative max-w-2xl mx-auto text-center"
        >
          {/* Floating 3D icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <IconBadge3D icon={Shield} size={64} />
            </motion.div>
          </div>

          <PillLabel>Get Started</PillLabel>

          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5"
            style={{ color: 'var(--text-primary)' }}
          >
            Ready to ask better questions?
          </h2>

          <p
            className="text-base leading-relaxed mb-9 max-w-md mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Upload your first document and get grounded, cited answers in under 3 seconds.
            Free to start, no credit card required.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-9 py-4 rounded-full transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #d4580a, #b84208)',
              boxShadow:
                '0 0 40px 12px rgba(212,88,10,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────── */}
      <footer
        style={{
          background: 'linear-gradient(to bottom, rgba(20,12,5,1) 0%, var(--bg-base) 100%)',
          borderTop: '1px solid var(--border-default)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #d4580a, #b84208)',
                    boxShadow: '0 0 12px 4px rgba(212,88,10,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  VeritasRAG
                </span>
              </div>
              <p
                className="text-sm leading-relaxed mb-2 max-w-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                Helping researchers and professionals get grounded, cited answers from their
                documents — instantly.
              </p>
              <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                Let&apos;s build something great.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white px-5 py-2.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #d4580a, #b84208)',
                  boxShadow: '0 0 16px 4px rgba(212,88,10,0.35)',
                }}
              >
                Start Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Product links */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                Product
              </p>
              <div className="space-y-2.5">
                {['Features', 'Process', 'Pricing', 'FAQ', 'Testimonials'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Account links */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                Account
              </p>
              <div className="space-y-2.5">
                {[
                  { label: 'Sign In', href: '/login' },
                  { label: 'Sign Up', href: '/signup' },
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Documents', href: '/documents' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="px-6 md:px-12 py-5"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © 2025 VeritasRAG. All rights reserved.
            </p>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Document intelligence powered by hybrid RAG · Zero hallucination guaranteed
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
