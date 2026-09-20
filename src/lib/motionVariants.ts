import { Variants } from 'motion/react';

// Smooth cubic bezier easing for glassy, fluid transitions
export const smoothEase = [0.22, 1, 0.36, 1] as const;
export const springPhysics = { type: 'spring' as const, damping: 24, stiffness: 280 };

// Page Entrance and Exit Variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 18,
    scale: 0.985,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: smoothEase,
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 0.99,
    filter: 'blur(3px)',
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
};

// Container with staggered children
export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

// Glass Card Entrance Variant
export const glassCardVariant: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.97,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: smoothEase,
    },
  },
};

// Fade up item variant
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: smoothEase },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: smoothEase },
  },
};

// Interactive card hover and tap variants
export const interactiveCardHover = {
  scale: 1.015,
  y: -3,
  transition: { duration: 0.2, ease: smoothEase },
};

export const interactiveCardTap = {
  scale: 0.985,
  y: 0,
  transition: { duration: 0.1 },
};
