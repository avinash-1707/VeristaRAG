"use client";

import { useId } from "react";
import Link from "next/link";

interface LogoMarkProps {
  size?: number;
}

function LogoMark({ size = 28 }: LogoMarkProps) {
  const uid = useId().replace(/:/g, "");
  const bgId = `vr-bg-${uid}`;
  const shineId = `vr-shine-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient
          id={bgId}
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f07828" />
          <stop offset="1" stopColor="#b84208" />
        </linearGradient>
        <radialGradient id={shineId} cx="50%" cy="0%" r="80%">
          <stop stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill={`url(#${bgId})`} />
      <rect width="40" height="40" rx="10" fill={`url(#${shineId})`} />
      <path
        d="M11 12 L20 28 L29 12"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface VeritasLogoProps {
  collapsed?: boolean;
  markSize?: number;
  href?: string;
  className?: string;
  textSize?: string;
  onClick?: () => void;
}

export default function VeritasLogo({
  collapsed = false,
  markSize = 28,
  href = "/",
  className = "",
  textSize = "text-[0.9375rem]",
  onClick,
}: VeritasLogoProps) {
  const inner = (
    <span className={`flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark size={markSize} />
      {!collapsed && (
        <span className={`flex items-baseline font-bold ${textSize}`} style={{ letterSpacing: "-0.01em" }}>
          <span style={{ color: "var(--text-primary)" }}>Veritas</span>
          <span style={{ color: "var(--accent-primary)" }}>RAG</span>
        </span>
      )}
    </span>
  );

  if (!href) return inner;
  return <Link href={href} onClick={onClick}>{inner}</Link>;
}

export { LogoMark };
