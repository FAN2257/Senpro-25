import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

interface MotionSectionProps extends PropsWithChildren {
  delay?: number;
  className?: string;
}

export function MotionSection({ children, delay = 0, className }: MotionSectionProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
    >
      {children}
    </motion.section>
  );
}
