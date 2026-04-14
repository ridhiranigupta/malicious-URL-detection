"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";

export function ParticlesBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mx = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const my = useSpring(mouseY, { stiffness: 60, damping: 20 });

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      onMouseMove={(event) => {
        mouseX.set((event.clientX / window.innerWidth - 0.5) * 40);
        mouseY.set((event.clientY / window.innerHeight - 0.5) * 40);
      }}
    >
      <motion.div
        style={{ x: mx, y: my }}
        className="absolute -top-24 left-12 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl"
      />
      <motion.div
        style={{ x: mx, y: my }}
        className="absolute bottom-10 right-12 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.18),transparent_40%)]" />
    </div>
  );
}
