'use client'

import { motion, useScroll, useTransform } from 'motion/react'
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
  Database,
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

const FEATURES = [
  {
    icon: Search,
    title: 'Hybrid Retrieval',
    desc: 'pgvector HNSW cosine ANN + BM25 full-text fused via reciprocal rank fusion. Maximum precision at every query.',
  },
  {
    icon: Shield,
    title: 'Grounded Answers',
    desc: 'Every response is anchored to exact source passages. A grounding score (0–1) flags low-confidence answers automatically.',
  },
  {
    icon: Zap,
    title: 'Redis Caching',
    desc: 'Repeated queries resolve in under 5ms from cache. Cold RAG completes in under 3 seconds end-to-end.',
  },
  {
    icon: Sparkles,
    title: 'SSE Streaming',
    desc: 'Token-by-token streaming from Gemini 2.0 Flash through Django to your browser. No waiting for full responses.',
  },
  {
    icon: Database,
    title: 'Cross-Encoder Reranking',
    desc: 'Top-20 candidates reranked to top-5 by ms-marco MiniLM. Precision over raw recall, every time.',
  },
  {
    icon: BookOpen,
    title: 'Exact Citations',
    desc: 'Chunk text, source document, page number, similarity score — every answer fully traceable back to the source.',
  },
]

const STEPS = [
  {
    icon: Upload,
    label: '01',
    title: 'Upload your documents',
    desc: 'PDF, DOCX, or TXT. Direct Cloudinary upload. Async ingestion via Celery — the UI never blocks.',
  },
  {
    icon: MessageSquare,
    label: '02',
    title: 'Ask in plain language',
    desc: 'Type any question about your documents. No special syntax or query language needed.',
  },
  {
    icon: CheckCircle2,
    label: '03',
    title: 'Get cited answers',
    desc: 'Grounded answers with exact citations: document, page, chunk, similarity score.',
  },
]

const STATS = [
  { value: '< 3s', label: 'Cold query', sub: 'end-to-end' },
  { value: '< 5ms', label: 'Cached query', sub: 'Redis hit' },
  { value: 'Top-5', label: 'Reranked', sub: 'from 20 candidates' },
  { value: '0.94', label: 'Avg similarity', sub: 'citation score' },
]

const TECH_PILLS = [
  'Gemini 2.0 Flash',
  'pgvector HNSW',
  'BM25 Full-text',
  'Cross-encoder',
  'Redis Cache',
  'Celery Async',
  'Cloudinary CDN',
  'Next.js 16',
  'Django 5',
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function HeroHeading() {
  return (
    <div>
      <div className="overflow-hidden">
        <motion.p
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: EASE_EXPO }}
          className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-[var(--text-primary)] leading-[1.02]"
        >
          No guessing.
        </motion.p>
      </div>

      <div className="overflow-hidden mt-[0.06em]">
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

      <div className="overflow-hidden mt-4">
        <motion.p
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.8, ease: EASE_EXPO }}
          className="text-xl md:text-2xl text-[var(--text-secondary)] font-normal leading-snug max-w-md"
        >
          Just your documents, answering back.
        </motion.p>
      </div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.65, ease: EASE_EXPO }}
      className="group relative bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6 cursor-default
                 transition-all duration-300
                 hover:border-[var(--border-accent)] hover:shadow-[0_0_40px_8px_var(--glow-soft)]
                 hover:bg-[var(--bg-surface-elevated)]"
    >
      {/* Icon badge */}
      <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border-accent)] flex items-center justify-center mb-5
                      group-hover:shadow-[0_0_16px_4px_#d4580a30] transition-shadow duration-300">
        <Icon className="h-5 w-5 text-[var(--accent-bright)]" />
      </div>

      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{desc}</p>
    </motion.div>
  )
}

// ─── Chat Mockup ──────────────────────────────────────────────────────────────

function ChatMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: -12 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: 0.45, duration: 1, ease: EASE_EXPO }}
      style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
    >
      {/* Perpetual float */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Outer glow orb */}
        <div
          className="absolute -inset-8 rounded-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 60%, #d4580a18 0%, transparent 70%)',
            filter: 'blur(16px)',
          }}
        />

        {/* Card */}
        <div className="relative bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl overflow-hidden shadow-[0_8px_80px_20px_var(--glow-soft),0_0_0_1px_var(--border-accent)]">
          {/* Header bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface-elevated)]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] opacity-60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] opacity-60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] opacity-60" />
            </div>
            <div className="flex-1 flex items-center gap-1.5 ml-2">
              <FileText className="h-3 w-3 text-[var(--accent-primary)]" />
              <span className="text-xs text-[var(--text-muted)]">research-paper.pdf</span>
            </div>
            <span className="text-[10px] bg-[var(--state-success-subtle)] text-[var(--state-success)] px-2 py-0.5 rounded-full border border-[var(--state-success)]/20 font-medium">
              Ready
            </span>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 min-w-[280px] max-w-[340px]">
            {/* User bubble */}
            <div className="flex justify-end">
              <div className="bg-[var(--accent-subtle)] border border-[var(--border-accent)] rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[82%]">
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  What methodology was used?
                </p>
              </div>
            </div>

            {/* AI bubble */}
            <div className="flex justify-start">
              <div className="bg-[var(--bg-card-inner)] border border-[var(--border-default)] rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[88%]">
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  The study employed a mixed-methods approach combining quantitative analysis with qualitative interviews across three cohorts
                  <motion.span
                    className="inline-block w-[2px] h-3 bg-[var(--accent-primary)] ml-0.5 align-text-bottom rounded-full"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                </p>
              </div>
            </div>

            {/* Sources */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="h-3 w-3 text-[var(--text-muted)]" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                  Sources
                </span>
              </div>

              {/* Citation 1 */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="bg-[var(--bg-card-inner)] border border-[var(--border-default)] rounded-xl p-2.5 mb-1.5"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                    research-paper.pdf · p.4
                  </span>
                  <span className="text-[10px] font-mono text-[var(--accent-primary)] bg-[var(--accent-subtle)] px-1.5 py-0.5 rounded font-semibold">
                    0.94
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[var(--text-muted)] leading-relaxed line-clamp-2">
                  &ldquo;The methodology employed a mixed-methods approach, combining quantitative data...&rdquo;
                </p>
              </motion.div>

              {/* Citation 2 */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.1, duration: 0.5 }}
                className="bg-[var(--bg-card-inner)] border border-[var(--border-default)] rounded-xl p-2.5"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                    research-paper.pdf · p.7
                  </span>
                  <span className="text-[10px] font-mono text-[var(--accent-primary)] bg-[var(--accent-subtle)] px-1.5 py-0.5 rounded font-semibold">
                    0.87
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[var(--text-muted)] leading-relaxed line-clamp-2">
                  &ldquo;Qualitative interviews were conducted with 45 participants across...&rdquo;
                </p>
              </motion.div>
            </div>

            {/* Grounding score */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-[var(--text-muted)]">Grounding confidence</span>
                <span className="text-[10px] font-mono font-semibold text-[var(--state-success)]">0.91</span>
              </div>
              <div className="h-1 bg-[var(--bg-card-inner)] rounded-full overflow-hidden border border-[var(--border-default)]">
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
          <div className="px-4 py-3 border-t border-[var(--border-default)] flex items-center gap-2 bg-[var(--bg-surface)]">
            <div className="flex-1 h-8 bg-[var(--bg-card-inner)] rounded-lg border border-[var(--border-strong)] px-3 flex items-center">
              <span className="text-[10px] text-[var(--text-muted)]">Ask another question...</span>
            </div>
            <button className="w-8 h-8 bg-gradient-to-br from-[#d4580a] to-[#b84208] rounded-lg flex items-center justify-center shadow-[0_0_12px_4px_#d4580a50] flex-shrink-0">
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const [particles, setParticles] = useState<Particle[]>([])
  const { scrollY } = useScroll()

  const heroY = useTransform(scrollY, [0, 600], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  useEffect(() => {
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (i * 41 + 17) % 100,
        y: (i * 29 + 11) % 100,
        size: (i % 3) + 1,
        duration: 3.5 + (i % 5),
        delay: (i * 0.27) % 5,
        opacity: 0.08 + (i % 5) * 0.04,
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
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          background: 'rgba(13,10,8,0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #d4580a, #b84208)',
              boxShadow: '0 0 16px 4px #d4580a55',
            }}
          >
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            VeritasRAG
          </span>
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-sm transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #d4580a, #b84208)',
              boxShadow: '0 0 20px 4px #d4580a55, inset 0 1px 0 #ffffff20',
            }}
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* ─── HERO ───────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 px-6 md:px-12 overflow-hidden">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d4580a15 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full h-[65%] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 100%, #d4580a1c 0%, transparent 72%)',
          }}
        />
        <div
          className="absolute left-[20%] top-[30%] w-96 h-96 pointer-events-none rounded-full"
          style={{
            background: 'radial-gradient(circle, #d4580a06 0%, transparent 70%)',
            filter: 'blur(48px)',
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
          {/* Left: copy */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }}>
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-7"
              style={{
                border: '1px solid var(--border-accent)',
                background: 'var(--accent-subtle)',
              }}
            >
              <Sparkles className="h-3 w-3" style={{ color: 'var(--accent-bright)' }} />
              <span
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--accent-bright)' }}
              >
                Hybrid RAG · Gemini 2.0 · pgvector
              </span>
            </motion.div>

            {/* Heading */}
            <HeroHeading />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.65, ease: EASE_EXPO }}
              className="mt-6 text-base leading-relaxed max-w-[26rem]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Upload PDFs, ask questions, and get answers{' '}
              <span style={{ color: 'var(--text-primary)' }}>grounded in your actual content</span> — with
              exact citations showing document, page, and passage.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: EASE_EXPO }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white px-7 py-3.5 rounded-lg transition-all duration-150"
                style={{
                  background: 'linear-gradient(135deg, #d4580a, #b84208)',
                  boxShadow: '0 0 24px 6px #d4580a55, inset 0 1px 0 #ffffff20',
                }}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm px-7 py-3.5 rounded-lg transition-all duration-150"
                style={{
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-strong)',
                }}
              >
                Sign In
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-5"
            >
              {[
                'Zero hallucination',
                'Exact citations',
                '< 3s response',
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: 'var(--state-success)' }} />
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
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
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
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-8 overflow-hidden"
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
          {TECH_PILLS.map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
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
      </motion.section>

      {/* ─── FEATURES ───────────────────────────────── */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE_EXPO }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4"
              style={{ border: '1px solid var(--border-accent)', background: 'var(--accent-subtle)' }}
            >
              <span
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--accent-bright)' }}
              >
                Capabilities
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Built for precision, not guesswork.
            </h2>
            <p className="mt-3 text-sm leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Every layer is engineered to maximize retrieval quality and response grounding. Zero hallucination is a design constraint, not a goal.
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────── */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 50% 40% at 50% 50%, #d4580a0b 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE_EXPO }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4"
              style={{ border: '1px solid var(--border-accent)', background: 'var(--accent-subtle)' }}
            >
              <span
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--accent-bright)' }}
              >
                Process
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              From upload to answer in seconds.
            </h2>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Dashed connector line (desktop) */}
            <div
              className="hidden md:block absolute top-8 h-px"
              style={{
                left: 'calc(16.67% + 32px)',
                right: 'calc(16.67% + 32px)',
                borderTop: '1px dashed var(--border-strong)',
              }}
            />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: EASE_EXPO }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-strong)',
                      boxShadow: '0 0 24px 4px var(--glow-soft)',
                    }}
                  >
                    <step.icon className="h-7 w-7" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  {/* Number badge */}
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{
                      background: 'var(--accent-subtle)',
                      border: '1px solid var(--border-accent)',
                      color: 'var(--accent-bright)',
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3
                  className="text-base font-semibold mb-2 tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed max-w-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="py-16 px-6 md:px-12"
        style={{
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: EASE_EXPO }}
              className="flex flex-col items-center"
            >
              <span
                className="text-3xl font-bold tracking-tight"
                style={{ color: 'var(--accent-primary)' }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs uppercase tracking-wider mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {stat.label}
              </span>
              <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {stat.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── CTA ────────────────────────────────────── */}
      <section className="relative py-32 px-6 md:px-12 overflow-hidden">
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 55% 45% at 50% 100%, #d4580a20 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[500px] h-[280px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 50% 100%, #d4580a12 0%, transparent 70%)',
            filter: 'blur(24px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: EASE_EXPO }}
          className="relative max-w-xl mx-auto text-center"
        >
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-6"
            style={{ border: '1px solid var(--border-accent)', background: 'var(--accent-subtle)' }}
          >
            <span
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: 'var(--accent-bright)' }}
            >
              Get Started
            </span>
          </div>

          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Stop guessing.
            <br />
            <span
              style={{
                background: 'linear-gradient(120deg, #f0905a 0%, #e8751a 30%, #d4580a 60%, #b84208 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Start knowing.
            </span>
          </h2>

          <p
            className="text-base leading-relaxed mb-9 max-w-md mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Upload your first document and get grounded, cited answers in under 3 seconds.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-9 py-4 rounded-lg transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #d4580a, #b84208)',
              boxShadow: '0 0 36px 10px #d4580a50, inset 0 1px 0 #ffffff20',
            }}
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────── */}
      <footer
        className="px-6 md:px-12 py-10"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #d4580a, #b84208)' }}
            >
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              VeritasRAG
            </span>
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Document intelligence powered by hybrid RAG · Grounded answers, zero hallucination
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
