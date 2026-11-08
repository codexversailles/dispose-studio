// UI Animation & Micro-Interactions Specialist (ui-animation-rules)
export const UI_EASING = [0.16, 1, 0.3, 1] as const; // #1: Decelerating ease-out
export const UI_EASE_IN_OUT = [0.65, 0, 0.35, 1] as const; // #9: Moves
export const UI_EASE_IN = [0.4, 0, 1, 1] as const; // #15: Exits 20% shorter

// #13: Non-bouncing everyday UI spring
export const UI_SPRING = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 34, // Critically damped, zero bounce
  mass: 0.9,
};

// #1, #2, #10 & #15: Modal / Popover motion
export const POPOVER_VARIANTS = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.18, // 180ms (#2)
      ease: UI_EASING,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.14, // 20% shorter exit (#15)
      ease: UI_EASE_IN,
    },
  },
};

// #3: Stagger list rows by 30ms
export const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

// #4: Button press compression (0.97)
export const PRESSABLE_PROPS = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.08, ease: 'easeOut' as const },
};
