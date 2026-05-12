"use client";

import { motion } from "motion/react";
import { EASE_EXPO, FEATURES } from "./constants";
import { FeatureCard } from "./FeatureCard";
import { PillLabel } from "./shared";

const CARD_W_VERT = 280;
const CARD_H_VERT = 320;
const CARD_W_HORIZ = 360;
const CARD_H_HORIZ = 200;
const STAGE = 820;
const C = STAGE / 2; // 410
const GAP = 18;

const positions = [
  // top — vertical — anchored right of center
  {
    top: C - CARD_H_VERT - GAP,
    left: C,
    width: CARD_W_VERT,
    height: CARD_H_VERT,
  },
  // right — horizontal — anchored below center
  {
    top: C,
    left: C + GAP,
    width: CARD_W_HORIZ,
    height: CARD_H_HORIZ,
  },
  // bottom — vertical — anchored left of center
  {
    top: C + GAP,
    left: C - CARD_W_VERT,
    width: CARD_W_VERT,
    height: CARD_H_VERT,
  },
  // left — horizontal — anchored above center
  {
    top: C - CARD_H_HORIZ,
    left: C - CARD_W_HORIZ - GAP,
    width: CARD_W_HORIZ,
    height: CARD_H_HORIZ,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-6 py-28 md:px-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,88,10,0.04) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: EASE_EXPO }}
          className="mb-16 text-center"
        >
          <PillLabel>Why VeritasRAG</PillLabel>
          <h2
            className="mb-4 text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: "var(--text-primary)" }}
          >
            Why users stick with it.
          </h2>
          <p
            className="mx-auto max-w-lg text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Every layer is engineered to maximize retrieval quality and response
            grounding. Zero hallucination is a design constraint, not a goal.
          </p>
        </motion.div>

        {/* ── Pinwheel stage ── */}
        <div style={{ overflowX: "auto", overflowY: "hidden" }}>
          <div
            className="mx-auto"
            style={{
              position: "relative",
              width: STAGE,
              height: STAGE,
              minWidth: STAGE,
            }}
          >
            {/* Central anchor ring */}
            <div
              style={{
                position: "absolute",
                left: C - 44,
                top: C - 44,
                width: 88,
                height: 88,
                borderRadius: "50%",
                border: "1px solid var(--border-default)",
                opacity: 0.4,
                pointerEvents: "none",
              }}
            />
            {/* Inner dot */}
            <div
              style={{
                position: "absolute",
                left: C - 4,
                top: C - 4,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--border-accent)",
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />

            {FEATURES.map((f, i) => {
              const pos = positions[i];
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.65,
                    ease: EASE_EXPO,
                  }}
                  style={{
                    position: "absolute",
                    top: pos.top,
                    left: pos.left,
                    width: pos.width,
                    height: pos.height,
                  }}
                >
                  <FeatureCard feature={f} index={i} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
