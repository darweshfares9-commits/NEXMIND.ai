import { motion } from "framer-motion";

/**
 * Ambient background: deep tech-black with subtle drifting grid,
 * slow aurora-like nebula glows, and a faint scanline pass.
 */
export function MatrixGrid() {
  return (
    <>
      {/* Base grid */}
      <div className="pointer-events-none fixed inset-0 matrix-grid opacity-40" />

      {/* Slow drifting nebula glow — cyan */}
      <motion.div
        className="pointer-events-none fixed -inset-[20%]"
        style={{
          background:
            "radial-gradient(40% 40% at 30% 40%, oklch(0.55 0.18 220 / 0.22), transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ x: ["-3%", "3%", "-3%"], y: ["-2%", "2%", "-2%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Slow drifting nebula glow — warm amber (mirror) */}
      <motion.div
        className="pointer-events-none fixed -inset-[20%]"
        style={{
          background:
            "radial-gradient(35% 35% at 70% 65%, oklch(0.6 0.16 60 / 0.16), transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{ x: ["2%", "-2%", "2%"], y: ["2%", "-2%", "2%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, oklch(0.08 0.015 240 / 0.7) 100%)",
        }}
      />

      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0 scanline opacity-25 mix-blend-screen" />
    </>
  );
}
