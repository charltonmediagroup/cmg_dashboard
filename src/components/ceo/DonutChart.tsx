import styles from "./ceo-dashboard.module.css";
import type { Rag } from "@/lib/ceo/rag";

/**
 * A donut gauge: one value against its target, drawn as an SVG ring with the
 * number centred inside. The number shares the ring's viewBox, so both scale
 * together at any card size.
 *
 * For a metric where less is better (cost per lead), the ring is a full circle
 * whose colour carries the state — green at or under target, amber/red once over
 * — so any breach reads as a complete red ring, not a partial one. The centre
 * shows the signed distance from target (`+79%`). For higher-is-better metrics
 * (leads) the ring fills toward target and the centre shows attainment (`101%`).
 */

const SIZE = 100;
const RADIUS = 40;
const STROKE = 13;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface DonutChartProps {
  /** 1 means exactly on target. Null when there is nothing to compare. */
  ratio: number | null;
  rag: Rag;
  /** Less-is-better metric: a full ring, coloured green under target and red over. */
  lowerIsBetter?: boolean;
  /** Small line under the number. */
  caption?: string;
}

export function DonutChart({ ratio, rag, lowerIsBetter = false, caption }: DonutChartProps) {
  const clamp = (n: number) => Math.max(0, Math.min(n, 1));
  // Less-is-better is a status ring: always a full circle, its colour (via rag)
  // carrying under/over target, so any breach is a complete red ring rather than
  // a partial or — at large overruns — empty one. Higher-is-better tracks
  // attainment, filling toward a full ring as it approaches target.
  const swept = ratio === null ? 0 : lowerIsBetter ? 1 : clamp(ratio);

  const label = (() => {
    if (ratio === null) return "—";
    if (!lowerIsBetter) return `${Math.floor(ratio * 100)}%`;
    const d = Math.round((ratio - 1) * 100);
    return `${d > 0 ? "+" : ""}${d}%`;
  })();

  const captionText = caption ?? (lowerIsBetter ? "vs target" : "of target");

  return (
    <div
      className={styles.donut}
      role="img"
      aria-label={ratio === null ? "No target comparison available" : `${label} ${captionText}`}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* A diagonal two-stop ombré per RAG state. The id is keyed by rag, so
            several donuts of the same state share one identical definition and
            duplicate ids never clash. */}
        <defs>
          <linearGradient id={`donutGrad-${rag}`} x1="0" y1="0" x2="1" y2="1">
            <stop className={styles.donutStopA} data-rag={rag} offset="0%" />
            <stop className={styles.donutStopB} data-rag={rag} offset="100%" />
          </linearGradient>
        </defs>
        <circle
          className={styles.donutTrack}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
        />
        {ratio !== null && swept > 0 && (
          <circle
            className={styles.donutValue}
            data-rag={rag}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${(CIRCUMFERENCE * swept).toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )}
        <text
          className={styles.donutPercent}
          x={SIZE / 2}
          y={captionText === "" ? SIZE / 2 : SIZE / 2 - 5}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {label}
        </text>
        {captionText !== "" && (
          <text
            className={styles.donutCaption}
            x={SIZE / 2}
            y={SIZE / 2 + 11}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {captionText}
          </text>
        )}
      </svg>
    </div>
  );
}
