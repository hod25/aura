import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

/** Wraps a page in the shared enter/exit transition. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[calc(100vh-4rem)]"
    >
      {children}
    </motion.div>
  );
}
