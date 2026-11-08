# Skill: UI Animation & Micro-Interactions Specialist (`ui-animation-rules`)

## Purpose
Apply elite, tactile, and mathematically precise motion design to web interfaces. Enforce 20 foundational interaction and animation heuristics when writing or reviewing frontend code (React, Framer Motion, CSS, Tailwind CSS, or Web Animations API).

---

## The 20 Foundational Heuristics

| # | Heuristic | Specific Technical Implementation |
|---|---|---|
| **1** | **Ease-out for entrances** | Use decelerating curves (`cubic-bezier(0.16, 1, 0.3, 1)` or `easeOut`). Elements enter at speed and brake naturally into place. |
| **2** | **Dropdowns at 150–250ms** | Keep open transitions strictly within 150ms–250ms. Never allow utility navigation to feel sluggish. |
| **3** | **Stagger list rows by 30ms** | Sequential items must use `staggerChildren: 0.03` (30ms per item). Cap maximum stagger delay across long lists (e.g., max 300ms total). |
| **4** | **Scale to 0.97 on press** | Active/pressed states compress uniformly to `scale(0.97)`. Avoid exaggerated drops (e.g., 0.90 is too heavy). |
| **5** | **Stretch moving knobs 12%** | Toggles and sliders stretch horizontally/along movement vector by 12% (`scaleX(1.12)` or `scaleY(1.12)`) while moving, returning to 1.0 on settle. |
| **6** | **Stagger as details settle** | Parent/container arrives first; inner child details (subtext, badges, avatars) stagger in 40–60ms after the shell lands. |
| **7** | **Arcs for object movement** | Two-dimensional movement must follow curved trajectories, not diagonal straight lines (separate X and Y easing or use curved bezier paths). |
| **8** | **Pulse to confirm success** | Use a subtle single-cycle radial ring expansion or 1.0 -> 1.04 -> 1.0 scale pulse to confirm actions without full page reloads. |
| **9** | **Ease-in-out for moves** | Transitions between two visible points on screen use symmetric acceleration/deceleration (`cubic-bezier(0.65, 0, 0.35, 1)`). |
| **10** | **Start popovers at 0.95** | Modals, tooltips, and popovers enter from `scale: 0.95`, not `scale: 0`. Full-zero scale feels cartoonish and disorienting. |
| **11** | **Enter from the trigger** | Set `transform-origin` dynamically or anchor initial `(x, y)` to match the exact coordinates of the clicked button or menu trigger. |
| **12** | **Exit to the trigger** | Collapsing states animate back toward their origin point rather than dropping out of the viewport. |
| **13** | **No bounce on everyday UI** | Overdamping ($\zeta \ge 1.0$) or no-overshoot springs (`stiffness: 300, damping: 30`) on forms, modals, tables, and dropdowns. Reserve bounce exclusively for celebratory game-like UI. |
| **14** | **Don't tween while held** | Direct manipulation (drag, scrub, pull) must map 1:1 to pointer coordinates (`pointermove`) with zero interpolation latency; resume spring physics only on release. |
| **15** | **Make exits 20% shorter** | Exit duration = `Entrance duration * 0.8`. Users already know what is leaving; exits should clear instantly with an accelerating curve (`ease-in`). |
| **16** | **Overlap old & new states** | In tab or route transitions, trigger the incoming element before the outgoing element completely finishes (overlap phase by 25–40%). |
| **17** | **Masks for reveals & colour** | Use CSS `clip-path` or SVG masks for expanding reveals, color floods, and surface wipes rather than animating widths/heights that trigger layout recalculation. |
| **18** | **Crossfade icons + blur** | Swapping icons (e.g., play to pause, sun to moon) must pair opacity crossfade with a momentary micro-blur (`filter: blur(2px) -> blur(0px)`). |
| **19** | **Rubber band past bounds** | Over-scroll and boundary pulls use logarithmic decay or square root resistance ($dx \propto \sqrt{\Delta\text{pointer}}$) with an immediate snapback. |
| **20** | **Reuse the same layoutId** | In Framer Motion, match `layoutId="unique-key"` across morphing shared components (e.g., active tab pills, card-to-modal expansions) to achieve seamless continuous geometry. |

---

## Code Reference Patterns

### 1. Framer Motion Presets

```typescript
// Shared physics constants
export const UI_TRANSITIONS = {
  // #1 & #10: Popovers & Entrances
  popover: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 }, // #15: Fast exit
    transition: {
      duration: 0.2, // #2: 200ms
      ease: [0.16, 1, 0.3, 1], // #1: Ease-out
    },
  },

  // #3: List staggering
  listContainer: {
    animate: {
      transition: {
        staggerChildren: 0.03, // 30ms stagger
      },
    },
  },

  // #4: Interactive button press
  pressable: {
    whileTap: { scale: 0.97 }, // Scale 0.97 on press
    transition: { duration: 0.1, ease: 'easeOut' },
  },

  // #13: Everyday UI non-bouncing spring
  smoothSpring: {
    type: 'spring',
    stiffness: 350,
    damping: 35, // Critically damped, zero bounce
    mass: 1,
  },
};
```

### 2. Animated Toggle with 12% Knob Stretch (#5)

```tsx
import { motion } from 'framer-motion';

export function Switch({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
        isOn ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
      }`}
    >
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
        // Knob stretches 12% horizontally during position changes
        animate={{
          scaleX: [1, 1.12, 1],
        }}
        className="w-6 h-6 bg-white rounded-full shadow-md"
      />
    </button>
  );
}
```

### 3. Icon Swap with Opacity + Blur (#18)

```tsx
import { AnimatePresence, motion } from 'framer-motion';

export function IconCrossfade({ isBookmarked }: { isBookmarked: boolean }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={isBookmarked ? 'active' : 'inactive'}
        initial={{ opacity: 0, filter: 'blur(3px)', scale: 0.9 }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
        exit={{ opacity: 0, filter: 'blur(3px)', scale: 0.9 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="inline-block"
      >
        {isBookmarked ? <ActiveIcon /> : <InactiveIcon />}
      </motion.span>
    </AnimatePresence>
  );
}
```

### 4. Sliding Tab Indicator (#20)

```tsx
import { motion } from 'framer-motion';

export function Tabs({ tabs, activeTab, onSelect }) {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className="relative px-4 py-2 text-sm font-medium transition-colors"
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-indicator" // #20: Shared layout ID
              className="absolute inset-0 bg-white rounded-md shadow-sm"
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 32, // #13: Crisp, no bounce
              }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## Generation Instructions for AI Agents

When acting as this skill:
1. **Never use bouncing or overshoot springs** unless the prompt explicitly mentions games, rewards, or playful interactions.
2. **Always inspect durations**: Dropdowns and tooltips must resolve in 150–250ms; dismissals and exits must be 20% faster than introductions.
3. **Always use GPU-accelerated transforms** (`transform`, `opacity`, `clip-path`). Avoid animating `top`, `left`, `margin`, `width`, or `height` unless using Framer Motion's `layout` engine with hardware acceleration.