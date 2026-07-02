import { motion } from "framer-motion";

/** The central NexMind core — a plasma sphere with rotating coronas. */
export function NexCore({ size = 220, pulse = true }: { size?: number; pulse?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.78 0.18 65 / 0.32), oklch(0.55 0.18 280 / 0.18) 40%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      <motion.svg
        className="absolute pointer-events-none"
        width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <circle cx={size/2} cy={size/2} r={size/2 - 4} fill="none"
          stroke="oklch(0.82 0.19 200 / 0.45)" strokeWidth="1" strokeDasharray="1 8" />
      </motion.svg>

      <motion.div
        className="relative rounded-full"
        style={{
          width: size * 0.62, height: size * 0.62,
          background: `radial-gradient(circle at 35% 30%, oklch(0.98 0.08 85) 0%, oklch(0.82 0.18 65) 22%, oklch(0.55 0.18 45) 55%, oklch(0.32 0.14 280) 90%, oklch(0.15 0.06 280) 100%)`,
          boxShadow: `
            0 0 80px oklch(0.78 0.18 65 / 0.55),
            0 0 140px oklch(0.55 0.18 280 / 0.35),
            inset -10px -16px 40px oklch(0.15 0.04 280 / 0.7),
            inset 8px 10px 24px oklch(0.98 0.08 85 / 0.35)
          `,
        }}
        animate={pulse ? { scale: [1, 1.04, 1] } : undefined}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: "18%",
            background: "radial-gradient(circle at 40% 35%, oklch(1 0.05 90 / 0.7), transparent 60%)",
            filter: "blur(6px)",
            mixBlendMode: "screen",
          }}
        />
      </motion.div>
    </div>
  );
}
