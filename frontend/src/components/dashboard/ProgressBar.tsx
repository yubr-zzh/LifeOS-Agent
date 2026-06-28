'use client';

import { motion } from 'framer-motion';

interface ProgressProps {
  value: number;
  color?: string;
}

export const Progress = ({ value, color = '#6366f1' }: ProgressProps) => {
  return (
    <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_3s_linear_infinite]" />
    </div>
  );
};
