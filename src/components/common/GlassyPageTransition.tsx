import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { pageVariants } from '../../lib/motionVariants';

interface GlassyPageTransitionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export const GlassyPageTransition: React.FC<GlassyPageTransitionProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`relative w-full ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
