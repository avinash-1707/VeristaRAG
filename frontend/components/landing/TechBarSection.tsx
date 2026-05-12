"use client";

import { motion } from "motion/react";
import { TECH } from "./constants";

// SVG logos keyed by tech name
const TECH_LOGOS: Record<string, React.ReactNode> = {
  "Gemini 2.0 Flash": (
    // Google Gemini mark (simplified gemini star shape)
    <svg
      width="14"
      height="14"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z"
        fill="currentColor"
      />
    </svg>
  ),
  "pgvector HNSW": (
    // Postgres elephant silhouette (simplified)
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.128 0a10.134 10.134 0 0 0-2.755.403C13.623.716 12.803 1.1 12.03 1.585a8.394 8.394 0 0 0-.91-.104C9.613 1.42 8.28 1.62 7.177 2.07c-2.04.81-3.357 2.138-3.906 3.87-.267.83-.316 1.772-.19 2.8.107.862.348 1.766.755 2.773-.274.795-.368 1.7-.222 2.658.2 1.33.785 2.314 1.757 2.955.44.29.909.428 1.4.452l.173.005a5.462 5.462 0 0 0 1.21-.144l.115-.03.044.189c.053.229.109.44.171.639.413 1.327 1.023 2.38 1.82 3.17.808.8 1.79 1.26 2.963 1.366.434.04.876.013 1.304-.085.46-.105.895-.296 1.3-.58l.175-.13.18.11c.39.243.83.39 1.32.436.474.044.994-.01 1.606-.177 1.02-.278 1.63-.955 1.994-1.8.38-.88.505-1.981.437-3.212a7.87 7.87 0 0 0-.054-.61l-.012-.093c.454-.19.858-.462 1.199-.826.57-.61.898-1.42 1.048-2.36.105-.658.105-1.398.012-2.17-.084-.7-.251-1.422-.497-2.15.29-.574.478-1.152.557-1.73.113-.837.048-1.685-.243-2.55C21.358 2.327 19.556.755 17.128 0zm-.888 1.44c.306-.013.6.016.878.086.05.013.099.027.148.042-.563.337-1.099.75-1.598 1.24a9.66 9.66 0 0 0-1.427 1.937c-.34-.036-.68-.054-1.017-.056.206-.36.45-.698.733-1.01.63-.7 1.403-1.202 2.283-1.24zm2.76.498c1.532.523 2.825 1.72 3.44 3.686.236.742.286 1.47.19 2.18-.073.553-.24 1.1-.51 1.648a17.444 17.444 0 0 0-.546-1.048c-.567-1.003-1.273-1.946-2.11-2.789a11.72 11.72 0 0 0-2.606-1.98 8.16 8.16 0 0 1 2.142-1.697zM12.45 3.296c.38.003.758.03 1.127.08a10.734 10.734 0 0 1 3.107 2.225c.79.789 1.453 1.682 1.988 2.63.535.946.9 1.927 1.09 2.94.193 1.021.186 2.03-.013 2.98a5.718 5.718 0 0 1-.952 2.273c-.376.498-.832.892-1.39 1.143a7.92 7.92 0 0 0-.112-.38l-.052-.163c.14-.08.274-.166.4-.26.596-.44 1.05-1.047 1.297-1.854.246-.806.264-1.745.09-2.773-.172-1.025-.542-2.047-1.087-2.987-.544-.94-1.242-1.797-2.074-2.459C15.04 6.692 14.07 6.26 13 6.18c-.284-.02-.57-.016-.857.017a4.19 4.19 0 0 0-.635.127 4.3 4.3 0 0 0-.608.24c-.1-.296-.187-.59-.258-.876.787-.27 1.58-.396 2.807-.392zm-3.88.678c.065.326.148.66.252.997-.427.305-.804.67-1.12 1.09a6.25 6.25 0 0 0-.797 1.654c-.447.002-.894.043-1.34.13.01-.036.017-.073.028-.108.459-1.455 1.567-2.554 2.977-3.763zm4.282 3.064c.825.059 1.6.43 2.272.978.672.55 1.23 1.278 1.651 2.064.422.787.686 1.63.81 2.454.124.825.106 1.607-.048 2.28-.155.672-.46 1.213-.924 1.55-.464.339-1.06.49-1.832.426-.77-.064-1.634-.357-2.542-.834l-.43-.232-.47.146c-.733.228-1.493.3-2.24.206-.748-.095-1.47-.36-2.099-.794-.83-.571-1.268-1.375-1.416-2.344-.13-.855-.02-1.81.353-2.672.028.029.058.054.087.083.55.534 1.249.908 2.07 1.14.822.232 1.762.314 2.795.232l.26-.02.167-.205c.482-.592.89-1.248 1.196-1.956.175-.4.317-.815.43-1.236.07-.256.127-.516.175-.78.144-.027.291-.043.44-.037zm-1.248.31a8.3 8.3 0 0 1-.072.278c-.11.41-.255.812-.44 1.193-.287.618-.664 1.193-1.11 1.72-.883.066-1.682-.005-2.38-.2-.696-.196-1.255-.507-1.674-.909a4.57 4.57 0 0 1-.175-.189c.1-.495.27-.966.506-1.408.236-.44.535-.839.882-1.183.333-.33.703-.608 1.1-.828.443-.24.93-.395 1.45-.45.465-.05.954 0 1.455.143.156.045.308.097.458.154v.68zm-6.024 4.22l.012.092c.168.78.524 1.514 1.085 2.095.56.581 1.317 1.002 2.293 1.13.772.102 1.594.048 2.394-.163.902.468 1.78.76 2.57.83 1.06.089 1.963-.155 2.683-.72a4.71 4.71 0 0 0 .328-.31c.013.211.019.42.014.627-.012.544-.092 1.076-.285 1.557-.242.612-.633 1.085-1.314 1.27-.494.135-.95.185-1.34.148-.275-.025-.52-.1-.74-.22l-.46-.262-.384.33c-.28.24-.603.407-.964.49-.328.075-.682.094-1.054.06-.881-.082-1.63-.453-2.263-1.083-.632-.63-1.155-1.553-1.523-2.74a10.64 10.64 0 0 1-.253-.867l-.045-.2-.195-.08a3.735 3.735 0 0 1-1.07-.661c-.57-.506-.912-1.197-1.072-2.142a5.714 5.714 0 0 1-.058-1.207c.164-.03.33-.055.498-.072.444-.048.895-.055 1.346-.022-.006.044-.009.089-.003.132zm9.23 6.28c.068.72.045 1.344-.088 1.87-.16.625-.46 1.078-.928 1.354l-.1.056c.032-.358.041-.745.022-1.16a8.26 8.26 0 0 0-.166-1.276c.228-.076.45-.164.665-.265.206-.097.404-.207.595-.33l.001-.25z"
        fill="currentColor"
      />
    </svg>
  ),
  "BM25 Full-text": (
    // Magnifying glass / search icon representing full-text search
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M15 15L21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 10h6M10 7v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  "Cross-encoder Reranking": (
    // Neural net / reranking arrows icon
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17 3l4 3-4 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 15l-4 3 4 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "Redis Cache": (
    // Redis cube/die logo (simplified)
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.978 10.442L12 15.5 2.022 10.442l.001-.002L12 5.385l9.977 5.055v.002z"
        fill="currentColor"
        fillOpacity=".85"
      />
      <path
        d="M21.978 13.442L12 18.5 2.022 13.442 12 8.385l9.978 5.057z"
        fill="currentColor"
        fillOpacity=".55"
      />
      <path
        d="M21.978 16.442L12 21.5 2.022 16.442 12 11.385l9.978 5.057z"
        fill="currentColor"
        fillOpacity=".3"
      />
    </svg>
  ),
  "Celery Async": (
    // Task queue / async icon
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M2 12h3M19 12h3M12 2v3M12 19v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  "Next.js 16": (
    // Next.js N logo
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.049-.106.005-4.703.007-4.705.073-.091a.637.637 0 0 1 .174-.143c.096-.047.134-.052.54-.052.479 0 .558.019.683.155a466.83 466.83 0 0 1 2.895 4.361c1.558 2.362 3.687 5.587 4.734 7.171l1.9 2.878.096-.063a12.317 12.317 0 0 0 2.465-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"
        fill="currentColor"
      />
    </svg>
  ),
  "Django 5": (
    // Django pony / D mark simplified
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.5 2h2.75v13.25c-1.41.268-2.444.375-3.569.375-3.353 0-5.125-1.516-5.125-4.42 0-2.8 1.879-4.613 4.791-4.613.455 0 .8.037 1.153.13V2zM11.5 9.063a2.643 2.643 0 0 0-.868-.125c-1.41 0-2.225.868-2.225 2.388 0 1.48.779 2.294 2.206 2.294.285 0 .519-.018.887-.072V9.063zM16.25 6.606H19v10.288c0 3.563-2.606 4.869-5.234 4.869-.87 0-1.694-.126-2.65-.406l.375-2.119c.696.25 1.278.358 1.963.358 1.357 0 2.797-.537 2.797-2.726v-.608a6.93 6.93 0 0 1-1.12.072c-3.069 0-4.844-1.713-4.844-4.493 0-2.888 1.894-4.5 4.97-4.5.892 0 1.731.1 2.494.375l-.5 1.89z"
        fill="currentColor"
      />
    </svg>
  ),
  FastAPI: (
    // FastAPI lightning bolt
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L4 13.5h7L9 22l11-12h-7.5L12 2z" fill="currentColor" />
    </svg>
  ),
};

export function TechBarSection() {
  return (
    <section
      className="overflow-hidden py-5"
      style={{
        borderTop: "1px solid var(--border-default)",
        borderBottom: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 px-6 md:px-12">
        <span
          className="mr-1 text-[10px] font-medium uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          Powered by
        </span>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {TECH.map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.045, duration: 0.35, ease: "easeOut" }}
              className="group inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150"
              style={{
                color: "var(--text-secondary)",
                background: "var(--bg-base)",
                border: "1px solid var(--border-default)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--text-primary)";
                el.style.borderColor =
                  "var(--border-strong, var(--text-muted))";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--text-secondary)";
                el.style.borderColor = "var(--border-default)";
              }}
            >
              {TECH_LOGOS[tech] && (
                <span
                  className="flex shrink-0 items-center opacity-70 group-hover:opacity-100"
                  aria-hidden
                >
                  {TECH_LOGOS[tech]}
                </span>
              )}
              {tech}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
