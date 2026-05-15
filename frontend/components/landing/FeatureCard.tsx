"use client";

import { motion } from "motion/react";
import { EASE_EXPO, FEATURES } from "./constants";
import { IconBadge3D } from "./shared";

type Variant = "vertical" | "horizontal";

const VARIANT_BY_INDEX: Variant[] = [
  "vertical",
  "horizontal",
  "vertical",
  "horizontal",
];

export function FeatureCard({
  feature,
  index,
  variant: variantOverride,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
  variant?: Variant;
}) {
  const variant = variantOverride ?? VARIANT_BY_INDEX[index] ?? "vertical";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.1, duration: 0.65, ease: EASE_EXPO }}
      className="group relative cursor-default overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: 20,
        padding: variant === "vertical" ? "24px" : "20px 22px",
        width: "100%",
        height: variantOverride ? "auto" : "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: variant === "vertical" ? "column" : "row",
        alignItems: variant === "horizontal" ? "center" : "flex-start",
        gap: variant === "horizontal" ? 18 : 0,
        transition: "border-color 300ms, box-shadow 300ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-accent)";
        e.currentTarget.style.boxShadow = "0 0 48px 8px var(--glow-soft)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* base glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 110%, rgba(212,88,10,0.18) 0%, transparent 65%)",
          borderRadius: 20,
        }}
      />
      {/* hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(212,88,10,0.30) 0%, transparent 65%)",
          borderRadius: 20,
        }}
      />

      {variant === "vertical" ? (
        <VerticalContent feature={feature} />
      ) : (
        <HorizontalContent feature={feature} />
      )}
    </motion.div>
  );
}

/* ── Vertical layout (top / bottom arms) ─────────────────────────── */

function VerticalContent({ feature }: { feature: (typeof FEATURES)[0] }) {
  return (
    <div className="relative flex h-full flex-col justify-between">
      <div>
        <div style={{ marginBottom: 16 }}>
          <IconBadge3D icon={feature.icon} size={48} />
        </div>
        <h3
          className="mb-2 text-base font-semibold leading-snug tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {feature.title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{
            color: "var(--text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {feature.desc}
        </p>
      </div>

      <div
        className="mt-4 inline-flex flex-col"
        style={{
          background: "var(--bg-card-inner)",
          border: "1px solid var(--border-default)",
          borderRadius: 12,
          padding: "10px 14px",
        }}
      >
        <span
          className="font-mono text-lg font-bold leading-tight"
          style={{ color: "var(--accent-bright)" }}
        >
          {feature.metric}
        </span>
        <span
          className="mt-1 text-[10px] uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {feature.metricLabel}
        </span>
      </div>
    </div>
  );
}

/* ── Horizontal layout (left / right arms) ───────────────────────── */

function HorizontalContent({ feature }: { feature: (typeof FEATURES)[0] }) {
  return (
    <>
      {/* icon — fixed left */}
      <div className="relative shrink-0">
        <IconBadge3D icon={feature.icon} size={48} />
      </div>

      {/* text + metric — fills remaining width */}
      <div className="relative flex min-w-0 flex-1 flex-col justify-center">
        <h3
          className="mb-1.5 text-base font-semibold leading-snug tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {feature.title}
        </h3>
        <p
          className="mb-3 text-xs leading-relaxed"
          style={{
            color: "var(--text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {feature.desc}
        </p>
        <div
          className="inline-flex flex-col self-start"
          style={{
            background: "var(--bg-card-inner)",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            padding: "8px 12px",
          }}
        >
          <span
            className="font-mono text-base font-bold leading-tight"
            style={{ color: "var(--accent-bright)" }}
          >
            {feature.metric}
          </span>
          <span
            className="mt-0.5 text-[10px] uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {feature.metricLabel}
          </span>
        </div>
      </div>
    </>
  );
}
