"use client";
import { motion } from "framer-motion";

export function FloatingBubblesBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-400/10 dark:bg-sky-600/10 rounded-full blur-3xl"
      />
    </div>
  );
}
