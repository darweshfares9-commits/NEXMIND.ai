import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TOOLS, CATEGORY_COLOR, type Orbit } from "@/lib/tools";

/**
 * NexMind neural core — a premium, HUD-style brain visualization.
 * Layered composition: rotating instrument rings, a top-down brain built
 * from concentric gyri, ambient particulate, curved synapses, and
 * glassmorphic neuron nodes.
 */

const RING: Record<Orbit, number> = { inner: 0.28, middle: 0.4, outer: 0.52 };

interface Node {
  slug: string;
  label: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  angle: number;
  orbit: Orbit;
}

function layout(): Node[] {
  const byOrbit: Record<Orbit, typeof TOOLS> = { inner: [], middle: [], outer: [] };
  TOOLS.forEach((t) => byOrbit[t.orbit].push(t));
  const out: Node[] = [];
  (Object.keys(byOrbit) as Orbit[]).forEach((orbit) => {
    const list = byOrbit[orbit];
    const n = list.length;
    const offset =
      orbit === "inner"
        ? -Math.PI / 2
        : orbit === "middle"
          ? -Math.PI / 2 + Math.PI / n
          : -Math.PI / 2 - Math.PI / (n * 2);
    list.forEach((t, i) => {
      out.push({
        slug: t.slug,
        label: t.label,
        color: CATEGORY_COLOR[t.category],
        Icon: t.icon,
        angle: (i / n) * Math.PI * 2 + offset,
        orbit,
      });
    });
  });
  return out;
}

export function BrainHub() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const nodes = useMemo(() => layout(), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = size.w / 2;
  const cy = size.h / 2;
  const unit = Math.min(size.w, size.h);
  const brainSize = Math.min(unit * 0.32, 360);

  // Ambient particulates
  const particles = useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => ({
        id: i,
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.4 + 0.4,
        d: Math.random() * 6 + 4,
        delay: Math.random() * 5,
      })),
    [],
  );

  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden">
      {/* Deep space backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 70% at 50% 50%, oklch(0.30 0.10 265 / 0.45), transparent 72%), radial-gradient(45% 45% at 25% 78%, oklch(0.28 0.11 195 / 0.28), transparent 72%), radial-gradient(35% 35% at 80% 22%, oklch(0.30 0.14 305 / 0.22), transparent 72%)",
        }}
      />

      {/* Fine grid lattice */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.85 0.15 200) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.15 200) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at 50% 50%, black 40%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 40%, transparent 78%)",
        }}
      />

      {size.w > 0 && (
        <>
          {/* Particulates */}
          <svg className="absolute inset-0 pointer-events-none" width={size.w} height={size.h}>
            {particles.map((p) => (
              <circle
                key={p.id}
                cx={p.x * size.w}
                cy={p.y * size.h}
                r={p.r}
                fill="oklch(0.85 0.15 200)"
                opacity="0.35"
              >
                <animate
                  attributeName="opacity"
                  values="0.05;0.6;0.05"
                  dur={`${p.d}s`}
                  begin={`${p.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </svg>

          {/* Synapses + traveling pulses */}
          <svg className="absolute inset-0 pointer-events-none" width={size.w} height={size.h}>
            <defs>
              <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="oklch(0.9 0.18 200)" stopOpacity="0.7" />
                <stop offset="40%" stopColor="oklch(0.55 0.2 280)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="oklch(0.15 0.05 260)" stopOpacity="0" />
              </radialGradient>
              <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer halo */}
            <circle cx={cx} cy={cy} r={brainSize * 1.05} fill="url(#haloGrad)" />

            {/* Instrument rings */}
            <g fill="none" stroke="oklch(0.85 0.15 200)" strokeOpacity="0.12">
              <circle cx={cx} cy={cy} r={unit * RING.inner} />
              <circle cx={cx} cy={cy} r={unit * RING.middle} strokeDasharray="2 6" />
              <circle cx={cx} cy={cy} r={unit * RING.outer} />
            </g>

            {/* Ring ticks (HUD feel) */}
            <g>
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i / 60) * Math.PI * 2;
                const r1 = unit * RING.outer + 4;
                const r2 = r1 + (i % 5 === 0 ? 8 : 3);
                return (
                  <line
                    key={i}
                    x1={cx + Math.cos(a) * r1}
                    y1={cy + Math.sin(a) * r1}
                    x2={cx + Math.cos(a) * r2}
                    y2={cy + Math.sin(a) * r2}
                    stroke="oklch(0.85 0.15 200)"
                    strokeOpacity={i % 5 === 0 ? 0.4 : 0.18}
                    strokeWidth="1"
                  />
                );
              })}
            </g>

            {/* Synapses */}
            {nodes.map((n) => {
              const r = unit * RING[n.orbit];
              const tx = cx + Math.cos(n.angle) * r;
              const ty = cy + Math.sin(n.angle) * r;
              const bend = 26;
              const midX = (cx + tx) / 2 + Math.cos(n.angle + Math.PI / 2) * bend;
              const midY = (cy + ty) / 2 + Math.sin(n.angle + Math.PI / 2) * bend;
              const d = `M ${cx + Math.cos(n.angle) * brainSize * 0.42} ${cy + Math.sin(n.angle) * brainSize * 0.42} Q ${midX} ${midY} ${tx} ${ty}`;
              return (
                <g key={`syn-${n.slug}`}>
                  <path d={d} fill="none" stroke={n.color} strokeOpacity="0.22" strokeWidth="1" />
                  <circle r="2.2" fill={n.color} filter="url(#pulseGlow)">
                    <animateMotion
                      dur={`${5 + (n.slug.charCodeAt(0) % 6)}s`}
                      repeatCount="indefinite"
                      path={d}
                      begin={`${(n.slug.charCodeAt(1) % 40) / 10}s`}
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Rotating outer HUD ring */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: cx,
              top: cy,
              translate: "-50% -50%",
              width: brainSize * 1.55,
              height: brainSize * 1.55,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <defs>
                <path id="hudArc" d="M 50 50 m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0" />
              </defs>
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="oklch(0.85 0.15 200)"
                strokeOpacity="0.22"
                strokeWidth="0.35"
                strokeDasharray="0.8 3"
              />
              <text fill="oklch(0.85 0.15 200)" fontSize="2.4" letterSpacing="0.35" opacity="0.55">
                <textPath href="#hudArc" startOffset="0">
                  NEXMIND · NEURAL CORE · v1.0 · SYNAPSE ONLINE · COGNITION STABLE ·
                </textPath>
              </text>
            </svg>
          </motion.div>

          {/* Counter-rotating inner ring */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: cx,
              top: cy,
              translate: "-50% -50%",
              width: brainSize * 1.2,
              height: brainSize * 1.2,
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="oklch(0.85 0.15 200)"
                strokeOpacity="0.35"
                strokeWidth="0.3"
                strokeDasharray="6 4 1 4"
              />
            </svg>
          </motion.div>

          {/* Brain core */}
          <div
            className="absolute pointer-events-none"
            style={{ left: cx, top: cy, translate: "-50% -50%", zIndex: 3 }}
          >
            <BrainCore size={brainSize} />
            <div className="mt-5 text-center">
              <div
                className="text-[10px] tracking-[0.55em] font-medium"
                style={{ color: "oklch(0.9 0.13 200)" }}
              >
                NEXMIND
              </div>
              <div className="text-[8px] tracking-[0.4em] text-muted-foreground mt-1.5">
                NEURAL · CORE
              </div>
            </div>
          </div>

          {/* Neurons */}
          {nodes.map((n) => {
            const r = unit * RING[n.orbit];
            const x = cx + Math.cos(n.angle) * r;
            const y = cy + Math.sin(n.angle) * r;
            return <Neuron key={n.slug} x={x} y={y} node={n} />;
          })}
        </>
      )}
    </div>
  );
}

function BrainCore({ size }: { size: number }) {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={{ scale: [1, 1.025, 1] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <radialGradient id="coreFill" cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor="oklch(0.96 0.12 195)" />
            <stop offset="30%" stopColor="oklch(0.72 0.19 235)" />
            <stop offset="65%" stopColor="oklch(0.42 0.2 285)" />
            <stop offset="100%" stopColor="oklch(0.16 0.08 275)" />
          </radialGradient>
          <linearGradient id="gyrusStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.98 0.1 195 / 0.95)" />
            <stop offset="100%" stopColor="oklch(0.55 0.2 290 / 0.5)" />
          </linearGradient>
          <radialGradient id="coreHighlight" cx="38%" cy="30%" r="45%">
            <stop offset="0%" stopColor="oklch(1 0.05 200 / 0.7)" />
            <stop offset="100%" stopColor="oklch(1 0.05 200 / 0)" />
          </radialGradient>
          <filter id="softBloom" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <clipPath id="brainClip">
            <path d="M100 22 C72 22 48 40 44 68 C28 74 22 96 34 114 C28 138 48 162 78 162 C86 176 114 176 122 162 C152 162 172 138 166 114 C178 96 172 74 156 68 C152 40 128 22 100 22 Z" />
          </clipPath>
        </defs>

        {/* Brain silhouette — smoother, top-down organic form */}
        <g>
          <path
            d="M100 22 C72 22 48 40 44 68 C28 74 22 96 34 114 C28 138 48 162 78 162 C86 176 114 176 122 162 C152 162 172 138 166 114 C178 96 172 74 156 68 C152 40 128 22 100 22 Z"
            fill="url(#coreFill)"
          />

          {/* Concentric gyri folds — clipped to brain shape */}
          <g clipPath="url(#brainClip)" stroke="url(#gyrusStroke)" fill="none" filter="url(#softBloom)">
            {/* Left hemisphere gyri */}
            <g strokeWidth="1.1" opacity="0.85">
              <path d="M95 30 C 75 40, 55 55, 55 80 C 55 100, 70 110, 88 108" />
              <path d="M95 45 C 78 55, 62 68, 62 88 C 62 108, 78 118, 93 116" />
              <path d="M95 62 C 82 70, 70 82, 72 100 C 74 118, 86 126, 95 124" />
              <path d="M95 80 C 86 86, 80 94, 82 106 C 84 118, 92 124, 96 122" />
              <path d="M60 120 C 66 132, 78 142, 92 144" />
              <path d="M50 100 C 54 116, 62 130, 74 138" />
            </g>
            {/* Right hemisphere gyri (mirrored) */}
            <g strokeWidth="1.1" opacity="0.85">
              <path d="M105 30 C 125 40, 145 55, 145 80 C 145 100, 130 110, 112 108" />
              <path d="M105 45 C 122 55, 138 68, 138 88 C 138 108, 122 118, 107 116" />
              <path d="M105 62 C 118 70, 130 82, 128 100 C 126 118, 114 126, 105 124" />
              <path d="M105 80 C 114 86, 120 94, 118 106 C 116 118, 108 124, 104 122" />
              <path d="M140 120 C 134 132, 122 142, 108 144" />
              <path d="M150 100 C 146 116, 138 130, 126 138" />
            </g>
            {/* Central fissure */}
            <path
              d="M100 26 C 98 60, 102 100, 100 170"
              strokeWidth="1.4"
              stroke="oklch(0.18 0.05 275 / 0.7)"
              opacity="0.9"
            />
            {/* Cross connections */}
            <g strokeWidth="0.5" opacity="0.4">
              <path d="M70 90 L 130 90" />
              <path d="M65 110 L 135 110" />
              <path d="M75 130 L 125 130" />
            </g>
          </g>

          {/* Rim highlight */}
          <path
            d="M100 22 C72 22 48 40 44 68 C28 74 22 96 34 114 C28 138 48 162 78 162 C86 176 114 176 122 162 C152 162 172 138 166 114 C178 96 172 74 156 68 C152 40 128 22 100 22 Z"
            fill="none"
            stroke="oklch(0.95 0.1 195 / 0.5)"
            strokeWidth="0.8"
          />

          {/* Top glossy highlight */}
          <ellipse cx="100" cy="70" rx="60" ry="30" fill="url(#coreHighlight)" opacity="0.75" />
        </g>
      </svg>

      {/* Pulsing inner glow */}
      <motion.div
        className="absolute inset-[22%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 42% 38%, oklch(1 0.08 200 / 0.4), transparent 65%)",
          mixBlendMode: "screen",
          filter: "blur(8px)",
        }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function Neuron({ x, y, node }: { x: number; y: number; node: Node }) {
  const { Icon, color, label, slug } = node;
  const delay = (slug.charCodeAt(0) % 20) / 10;
  return (
    <div
      className="absolute pointer-events-auto"
      style={{ left: x, top: y, translate: "-50% -50%", zIndex: 4 }}
    >
      <Link
        to="/tools/$slug"
        params={{ slug }}
        className="group flex flex-col items-center gap-2 select-none"
      >
        <motion.div
          className="relative flex items-center justify-center rounded-full backdrop-blur-md"
          style={{
            width: 44,
            height: 44,
            background: `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${color} 22%, transparent), color-mix(in oklab, var(--surface) 75%, transparent))`,
            border: `1px solid color-mix(in oklab, ${color} 70%, transparent)`,
            boxShadow: `0 0 18px color-mix(in oklab, ${color} 55%, transparent), inset 0 0 12px color-mix(in oklab, ${color} 25%, transparent)`,
            color,
          }}
          animate={{
            boxShadow: [
              `0 0 12px color-mix(in oklab, ${color} 45%, transparent), inset 0 0 8px color-mix(in oklab, ${color} 20%, transparent)`,
              `0 0 26px color-mix(in oklab, ${color} 75%, transparent), inset 0 0 14px color-mix(in oklab, ${color} 35%, transparent)`,
              `0 0 12px color-mix(in oklab, ${color} 45%, transparent), inset 0 0 8px color-mix(in oklab, ${color} 20%, transparent)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
          whileHover={{ scale: 1.22 }}
        >
          <Icon size={18} />
          {/* Outer aura on hover */}
          <span
            className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle, color-mix(in oklab, ${color} 40%, transparent), transparent 70%)`,
              filter: "blur(6px)",
            }}
          />
        </motion.div>
        <span
          className="text-[9px] tracking-[0.18em] uppercase whitespace-nowrap opacity-70 group-hover:opacity-100 transition"
          style={{ color: "oklch(0.94 0.02 200)" }}
        >
          {label}
        </span>
      </Link>
    </div>
  );
}
