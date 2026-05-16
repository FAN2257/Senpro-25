import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

interface MotionSectionProps extends HTMLMotionProps<'section'> {
  delay?: number;
  className?: string;
}

export function MotionSection({ children, delay = 0, className, ...rest }: MotionSectionProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
