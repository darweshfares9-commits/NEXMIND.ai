import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { NexCore } from "./Core";
import { TOOLS, CATEGORY_COLOR, type Orbit } from "@/lib/tools";

const ORBIT_RATIO: Record<Orbit, number> = { inner: 0.22, middle: 0.34, outer: 0.46 };
const ORBIT_DUR:   Record<Orbit, number> = { inner: 110,   middle: 160,  outer: 220  };
const ORBIT_DIR:   Record<Orbit, 1 | -1> = { inner: 1,     middle: -1,   outer: 1    };

interface Placed {
  slug: string;
  label: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  angle: number;       // radians
  orbit: Orbit;
}

function placeTools(): Placed[] {
  const byOrbit: Record<Orbit, typeof TOOLS> = { inner: [], middle: [], outer: [] };
  TOOLS.forEach((t) => byOrbit[t.orbit].push(t));
  const out: Placed[] = [];
  (Object.keys(byOrbit) as Orbit[]).forEach((orbit) => {
    const list = byOrbit[orbit];
    const n = list.length;
    list.forEach((t, i) => {
      out.push({
        slug: t.slug,
        label: t.label,
        color: CATEGORY_COLOR[t.category],
        Icon: t.icon,
        angle: (i / n) * Math.PI * 2 - Math.PI / 2,
        orbit,
      });
    });
  });
  return out;
}

export function Galaxy() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const placed = placeTools();

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = size.w / 2;
  const cy = size.h / 2;
  const unit = Math.min(size.w, size.h);

  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden">
      {/* Orbit rings */}
      {size.w > 0 && (["inner", "middle", "outer"] as Orbit[]).map((orbit) => {
        const r = unit * ORBIT_RATIO[orbit];
        return (
          <svg key={orbit} className="absolute inset-0 pointer-events-none" width={size.w} height={size.h}>
            <circle cx={cx} cy={cy} r={r} fill="none"
              stroke="oklch(0.82 0.19 200 / 0.1)" strokeWidth="1" strokeDasharray="2 6" />
          </svg>
        );
      })}

      {/* Central core */}
      {size.w > 0 && (
        <div className="absolute" style={{ left: cx, top: cy, translate: "-50% -50%", zIndex: 5 }}>
          <NexCore size={Math.min(unit * 0.22, 260)} />
          <div className="mt-3 text-center">
            <div className="text-[10px] tracking-[0.5em] text-glow-cyan" style={{ color: "var(--cyan)" }}>
              NEXMIND · CORE
            </div>
            <div className="text-[9px] tracking-[0.35em] text-muted-foreground mt-1">
              SELECT A CAPABILITY
            </div>
          </div>
        </div>
      )}

      {/* Tool nodes */}
      {size.w > 0 && (["inner", "middle", "outer"] as Orbit[]).map((orbit) => {
        const r = unit * ORBIT_RATIO[orbit];
        const dur = ORBIT_DUR[orbit];
        const dir = ORBIT_DIR[orbit];
        const items = placed.filter((p) => p.orbit === orbit);
        return (
          <motion.div
            key={orbit}
            className="absolute pointer-events-none"
            style={{ left: cx, top: cy, width: 0, height: 0 }}
            animate={{ rotate: dir * 360 }}
            transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
          >
            {items.map((p) => {
              const x = Math.cos(p.angle) * r;
              const y = Math.sin(p.angle) * r;
              return (
                <ToolDot key={p.slug} x={x} y={y} placed={p} counterRotate={-dir * 360} duration={dur} />
              );
            })}
          </motion.div>
        );
      })}
    </div>
  );
}

function ToolDot({
  x, y, placed, counterRotate, duration,
}: { x: number; y: number; placed: Placed; counterRotate: number; duration: number }) {
  const { Icon, color, label, slug } = placed;
  return (
    <div
      className="absolute pointer-events-auto"
      style={{ left: x, top: y, translate: "-50% -50%" }}
    >
      {/* Counter-rotate so labels stay upright */}
      <motion.div
        animate={{ rotate: counterRotate }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <Link
          to="/tools/$slug"
          params={{ slug }}
          className="group flex flex-col items-center gap-1.5 select-none"
        >
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="relative w-9 h-9 rounded-full flex items-center justify-center transition"
            style={{
              background: "color-mix(in oklab, var(--surface) 60%, transparent)",
              border: `1px solid ${color}`,
              boxShadow: `0 0 12px ${color}, inset 0 0 8px color-mix(in oklab, ${color} 30%, transparent)`,
              color,
            }}
          >
            <Icon size={16} />
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition"
              style={{ boxShadow: `0 0 24px ${color}, 0 0 48px ${color}` }}
            />
          </motion.div>
          <span
            className="text-[9px] tracking-[0.15em] uppercase whitespace-nowrap opacity-70 group-hover:opacity-100 transition"
            style={{ color: "oklch(0.92 0.01 200)" }}
          >
            {label}
          </span>
        </Link>
      </motion.div>
    </div>
  );
}
