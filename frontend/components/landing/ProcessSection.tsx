"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "motion/react";
import { EASE_EXPO, STEPS } from "./constants";
import { IconBadge3D, PillLabel } from "./shared";

function GlowLine({
  progress,
  orientation,
}: {
  progress: MotionValue<number>;
  orientation: "horizontal" | "vertical";
}) {
  const isH = orientation === "horizontal";
  const W = isH ? 1000 : 6;
  const H = isH ? 6 : 1000;
  const pathD = isH ? `M 0 3 L 1000 3` : `M 3 0 L 3 1000`;
  const pathLength = 1000;

  // Head position: 0 → 1000 as progress goes 0 → 1
  const headPos = useTransform(progress, [0, 1], [0, pathLength]);

  // The filled "already glowed" trail — always from 0 to headPos
  const trailDashArray = useTransform(headPos, (h) => `${h} ${pathLength - h}`);
  const trailDashOffset = `0`;

  // The bright moving orb: a short 160-unit segment at the head
  const ORB_LENGTH = 160;
  const orbTailPos = useTransform(headPos, (h) => Math.max(0, h - ORB_LENGTH));
  const orbDashArray = useTransform(
    [headPos, orbTailPos] as MotionValue<number>[],
    ([h, t]: number[]) => `${h - t} ${pathLength - (h - t)}`,
  );
  const orbDashOffset = useTransform(orbTailPos, (t) => -t);

  const headOpacity = useTransform(progress, [0, 0.03], [0, 1]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
      aria-hidden
    >
      <defs>
        <filter
          id={`glow-soft-${orientation}`}
          x="-300%"
          y="-300%"
          width="700%"
          height="700%"
        >
          <feGaussianBlur stdDeviation={isH ? "0 6" : "6 0"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id={`glow-orb-${orientation}`}
          x="-400%"
          y="-400%"
          width="900%"
          height="900%"
        >
          <feGaussianBlur stdDeviation={isH ? "0 10" : "10 0"} result="blur1" />
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={isH ? "0 4" : "4 0"}
            result="blur2"
          />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Trail gradient: dim orange all the way through */}
        <linearGradient
          id={`trail-grad-${orientation}`}
          gradientUnits="userSpaceOnUse"
          x1={isH ? "0" : "3"}
          y1={isH ? "3" : "0"}
          x2={isH ? "1000" : "3"}
          y2={isH ? "3" : "1000"}
        >
          <stop offset="0%" stopColor="rgba(212,88,10,0.55)" />
          <stop offset="100%" stopColor="rgba(234,118,30,0.75)" />
        </linearGradient>

        {/* Orb gradient: tail fades in, head is white-hot */}
        <linearGradient
          id={`orb-grad-${orientation}`}
          gradientUnits="userSpaceOnUse"
          x1={isH ? "0" : "3"}
          y1={isH ? "3" : "0"}
          x2={isH ? "1000" : "3"}
          y2={isH ? "3" : "1000"}
        >
          <stop offset="0%" stopColor="rgba(212,88,10,0)" />
          <stop offset="50%" stopColor="rgba(234,118,30,0.9)" />
          <stop offset="85%" stopColor="rgba(255,150,50,1)" />
          <stop offset="100%" stopColor="rgba(255,220,160,1)" />
        </linearGradient>
      </defs>

      {/* 1. Dim track */}
      <path
        d={pathD}
        stroke="var(--border-default)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />

      {/* 2. Glowed trail — from 0 to head, stays lit */}
      <motion.path
        d={pathD}
        stroke={`url(#trail-grad-${orientation})`}
        strokeWidth={isH ? "6" : "6"}
        fill="none"
        filter={`url(#glow-soft-${orientation})`}
        strokeLinecap="round"
        style={{
          strokeDasharray: trailDashArray,
          strokeDashoffset: trailDashOffset,
        }}
      />
      {/* Trail core (brighter thin line) */}
      <motion.path
        d={pathD}
        stroke={`url(#trail-grad-${orientation})`}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        style={{
          strokeDasharray: trailDashArray,
          strokeDashoffset: trailDashOffset,
        }}
      />

      {/* 3. Moving orb — bright moving head with bloom */}
      <motion.path
        d={pathD}
        stroke={`url(#orb-grad-${orientation})`}
        strokeWidth={isH ? "10" : "10"}
        fill="none"
        filter={`url(#glow-orb-${orientation})`}
        strokeLinecap="round"
        style={{
          strokeDasharray: orbDashArray,
          strokeDashoffset: orbDashOffset,
          opacity: headOpacity,
        }}
      />
      <motion.path
        d={pathD}
        stroke={`url(#orb-grad-${orientation})`}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        style={{
          strokeDasharray: orbDashArray,
          strokeDashoffset: orbDashOffset,
          opacity: headOpacity,
        }}
      />

      {/* 4. Hot dot at the very tip */}
      <motion.circle
        cx={isH ? headPos : 3}
        cy={isH ? 3 : headPos}
        r="5"
        fill="rgba(255,210,140,1)"
        filter={`url(#glow-orb-${orientation})`}
        style={{ opacity: headOpacity }}
      />
    </svg>
  );
}

export function ProcessSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.65"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 22,
    restDelta: 0.001,
  });

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-28 md:px-12"
      style={{
        borderTop: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(212,88,10,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: EASE_EXPO }}
          className="mb-20 text-center"
        >
          <PillLabel>Process</PillLabel>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            The Process. Fast, Clear, Done.
          </h2>
          <p
            className="mt-3 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            No manual work. No waiting. Just answers grounded in your content.
          </p>
        </motion.div>

        <div className="relative">
          {/* Desktop horizontal line — vertically centred in the cards */}
          <div
            className="pointer-events-none absolute hidden md:block"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              left: "16.67%",
              right: "16.67%",
              height: 24,
              zIndex: 0,
            }}
          >
            <GlowLine progress={smoothProgress} orientation="horizontal" />
          </div>

          {/* Mobile vertical line */}
          <div
            className="pointer-events-none absolute block md:hidden"
            style={{
              left: 36,
              top: 44,
              bottom: 44,
              width: 24,
              zIndex: 0,
            }}
          >
            <GlowLine progress={smoothProgress} orientation="vertical" />
          </div>

          {/* Cards — spaced further apart */}
          <div
            className="relative grid grid-cols-1 md:grid-cols-3"
            style={{ gap: "2.5rem", zIndex: 1 }}
          >
            {STEPS.map((step, i) => {
              const threshold = i / STEPS.length;
              const opacity = useTransform(
                smoothProgress,
                [threshold, threshold + 0.28],
                [0, 1],
              );
              const y = useTransform(
                smoothProgress,
                [threshold, threshold + 0.28],
                [28, 0],
              );

              return (
                <motion.div key={step.step} style={{ opacity, y }}>
                  <div
                    className="relative overflow-hidden flex flex-col items-center text-center"
                    style={{
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-default)",
                      borderRadius: 9999,
                      padding: "clamp(28px, 5vw, 48px) clamp(20px, 4vw, 32px)",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(ellipse 80% 55% at 50% 115%, rgba(212,88,10,0.16) 0%, transparent 65%)",
                        borderRadius: 9999,
                      }}
                    />
                    <div className="relative flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3">
                        <IconBadge3D icon={step.icon} />
                        <span
                          className="font-mono text-3xl font-bold tracking-tight"
                          style={{ color: "var(--border-strong)" }}
                        >
                          {step.step}
                        </span>
                      </div>
                      <h3
                        className="text-base font-semibold tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
