"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export const GlassCard = ({ children, className, delay = 0, ...props }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className={cn("glass rounded-2xl relative overflow-hidden", className)}
      {...props}
    >
      {/* Borda brilhante sutil por cima do glassmorphism */}
      <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
