"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { EASE_EXPO } from "./constants";

function FloatingPaths({
  position,
  color,
}: {
  position: number;
  color: string;
}) {
  const paths = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    opacity: Math.min(0.08 + i * 0.018, 0.52),
    width: 0.7 + i * 0.07,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={color}
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            initial={{ pathLength: 0.2, opacity: path.opacity * 0.3 }}
            animate={{
              pathLength: 1,
              opacity: [path.opacity * 0.55, path.opacity, path.opacity * 0.55],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 18 + (path.id % 7) * 3,
              repeat: Infinity,
              ease: "linear",
              delay: path.id * 0.32,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const HEADLINE_LINES = ["No guessing.", "No hallucination."];

export function HeroSection() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -70]);
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0]);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-28 pb-24 md:px-12">
      {/* Flowing paths — two complementary orange shades for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingPaths position={1} color="#d4580a" />
        <FloatingPaths position={-1} color="#e8751a" />
      </div>

      {/* Center vignette — dark oval carves readable space for text */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 46%, rgba(13,10,8,0.78) 0%, rgba(13,10,8,0.32) 55%, transparent 100%)",
        }}
      />

      {/* Bottom orange glow — brand anchor */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(212,88,10,0.44) 0%, rgba(138,58,6,0.14) 50%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "52%",
          height: "38%",
          background:
            "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(232,117,26,0.52) 0%, rgba(212,88,10,0.14) 44%, transparent 68%)",
          filter: "blur(36px)",
        }}
      />

      {/* Centered content */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center"
      >
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_EXPO }}
          className="mb-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            border: "1px solid var(--border-accent)",
            background: "var(--accent-subtle)",
          }}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ background: "var(--accent-bright)" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: "var(--accent-primary)" }}
            />
          </span>
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "var(--accent-bright)" }}
          >
            Hybrid RAG · Gemini 2.0 · pgvector
          </span>
        </motion.div>

        {/* Headline — per-letter spring drop, centered */}
        <div className="mb-8 w-full">
          {HEADLINE_LINES.map((line, lineIndex) => (
            <div
              key={lineIndex}
              className={`flex flex-wrap justify-center gap-x-[0.18em] ${lineIndex === 1 ? "mt-[0.06em]" : ""}`}
            >
              {line.split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-flex">
                  {word.split("").map((letter, letterIndex) => {
                    const globalIndex =
                      line.split(" ").slice(0, wordIndex).join(" ").length +
                      (wordIndex > 0 ? 1 : 0) +
                      letterIndex;
                    return (
                      <motion.span
                        key={`${lineIndex}-${wordIndex}-${letterIndex}`}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          delay: lineIndex * 0.22 + globalIndex * 0.03,
                          type: "spring",
                          stiffness: 150,
                          damping: 22,
                        }}
                        className="inline-block font-bold tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl"
                        style={
                          lineIndex === 1
                            ? {
                                background:
                                  "linear-gradient(118deg, #faa06a 0%, #e8751a 35%, #d4580a 65%, #a83208 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                lineHeight: 1.05,
                              }
                            : {
                                color: "var(--text-primary)",
                                lineHeight: 1.05,
                              }
                        }
                      >
                        {letter}
                      </motion.span>
                    );
                  })}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Thin orange divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.72, duration: 0.7, ease: EASE_EXPO }}
          className="mb-7 h-px w-16"
          style={{
            background:
              "linear-gradient(90deg, transparent, #d4580a, transparent)",
          }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.65, ease: EASE_EXPO }}
          className="mb-10 max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Upload documents, ask questions, get answers{" "}
          <span style={{ color: "var(--text-primary)" }}>
            grounded in your actual content
          </span>{" "}
          — with exact citations showing document, page, and passage.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: EASE_EXPO }}
          className="mb-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #d4580a, #b84208)",
              boxShadow:
                "0 0 36px 10px rgba(212,88,10,0.42), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-medium transition-all duration-150"
            style={{
              color: "var(--text-primary)",
              border: "1px solid var(--border-strong)",
            }}
          >
            See Features
            <ChevronRight className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Trust chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          {[
            "Zero hallucination",
            "Exact citations",
            "< 3s response",
          ].map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <CheckCircle2
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: "var(--state-success)" }}
              />
              {item}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--text-muted)" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-6 w-4 items-start justify-center rounded-full pt-1"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          <div
            className="h-1.5 w-1 rounded-full"
            style={{ background: "var(--accent-primary)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
