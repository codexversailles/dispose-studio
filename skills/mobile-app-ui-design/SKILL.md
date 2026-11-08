---
name: mobile-app-ui-design
description: Guides the creation of professional, polished mobile app interfaces following proven design principles from top-tier apps (Airbnb, Duolingo, Spotify, Revolut, Phantom).
---

# Mobile App UI/UX Design Specialist

## Purpose

Guide the creation of world-class, tactile, high-retention mobile app interfaces that follow the proven UX and UI design principles used by top-tier mobile products (e.g., Airbnb, Duolingo, Spotify, Revolut, Phantom).

Great mobile UI is not about superficial flashiness or decorative clutter — it is about **intentionality, clarity, and emotional resonance**. Every pixel, tap target, spacing token, and color choice must reduce user friction and elevate trust.

---

## The 3 Guiding Questions (Pre-Design Audit)

Before drafting any screen, evaluate:
1. **Goal**: What exact task is the user attempting to accomplish? (Eliminate all unnecessary friction toward that goal).
2. **Emotion**: How should this screen make the user feel? (Trust for fintech/crypto, momentum for fitness, calm for health, delight for consumer tools).
3. **Focal Anchor**: What is the single element they must notice first? (Establish indisputable visual hierarchy).

---

## 5-Step Mobile Design Process

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Context & Stage  ──►  2. Structure & UX (Thumb Zone)     │
│ 3. Visual UI (8pt)  ──►  4. Emotion & Peak-End  ──► 5. Polish│
└─────────────────────────────────────────────────────────────┘
```

### Step 1: Understand Context & User Stage
- **Domain Context**: Finance, fitness, e-commerce, camera/studio, crypto, or productivity. Respect standard platform conventions (iOS Human Interface Guidelines & Android Material 3).
- **User Stage Adaptation**:
  - *New Users*: Minimal surface area, high guidance, friendly defaults, zero cognitive overload.
  - *Returning Users*: Routine-focused, quick-resume states, visible progress indicators.
  - *Power Users*: High-density data, keyboard/gesture shortcuts, advanced filters.

### Step 2: Structure First (UX Lens)
1. **Thumb Zone Architecture**:
   - Place primary interactive elements (CTAs, key filters, navigation, action sheets) in the bottom $1/3$ of the screen.
   - Place static information, headers, and destructive/rarely-used controls in the top zone.
2. **F-Pattern Reading Order**:
   - Align primary anchors along the left edge for rapid vertical scanning.
   - Align quantitative values or status accessories along the right edge.
3. **Minimize Interaction Cost**:
   - Expose core content and selections directly on the surface rather than hiding them behind nested modals or extra clicks.
   - Keep forms short; use smart defaults and device sensors/camera whenever possible.
4. **Transform Empty States**:
   - Never show a dead-end blank canvas.
   - Include a contextual icon/illustration, empathetic copy explaining *why* it's empty, and a prominent 1-tap Call-to-Action to populate data.
5. **Input Method Selection**:
   - Use **switches, segmented pills, or wheels** for fast single-tap decisions.
   - Use **steppers or sliders** strictly for bounded, approximate adjustments (e.g., volume, zoom level).
   - Use **numeric/text fields** for exact or repeated data entry.

### Step 3: Apply Visual Design (UI Lens)

#### 1. Typography Discipline
- **Family Limit**: Exactly 1 font family (maximum 2 when pairing an editorial display font with a clean neutral UI sans).
- **Size Scale Limit**: Maximum 4 sizes across a single view:
  - Display / Hero Metric: `28px – 34px` (Bold / SemiBold)
  - Section Header: `17px – 20px` (SemiBold / Medium)
  - Primary Body / Action: `14px – 15px` (Regular / Medium)
  - Caption / Micro Metadata: `11px – 12px` (Medium / Regular)
- **Weight Limit**: Maximum 2 weights per screen (typically Medium `500` and Regular `400`).
- **Tabular Numbers**: Use monospace or `tabular-nums` for metrics, prices, timers, and financial values.
- **Reading Width**: Keep text containers under `600px` (or `max-w-md` on mobile viewports).

#### 2. The 60 / 30 / 10 Color System
- **60% Neutral Canvas**: Background and large continuous surfaces (`#0E1017` dark, `#F8F9FA` light).
- **30% Structural Base**: Cards, text elements, dividers, borders, and secondary surfaces.
- **10% Intentional Accent**: CTAs, key status highlights, active states, and focal icons.
- **Text Opacity Hierarchy**:
  - Primary Headings / Values: `100%` (`text-zinc-100` / `text-zinc-900`)
  - Body Text: `75% – 85%` (`text-zinc-300` / `text-zinc-700`)
  - Secondary Metadata / Labels: `50% – 60%` (`text-zinc-400` / `text-zinc-500`)
  - Disabled / Placeholder: `30% – 35%` (`text-zinc-600` / `text-zinc-400`)
- **Tinted Shadows**: Never cast raw black/grey shadows (`rgba(0,0,0,0.5)`) onto colored surfaces. Always tint shadow hues with the background chassis color.
- **Accent Restraint**: Reserve red/warning colors exclusively for destructive, critical moments.

#### 3. 8-Point Grid Spacing System
- Every padding, margin, width, and height value must follow an 8pt or 4pt increment:
  - Tokens: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `80px`.
- **Relationship Multiplier Rule**:
  - Spacing between directly related elements (e.g., Title and Subtitle) = $X$ (e.g., `4px` or `8px`).
  - Spacing to the next unrelated group = $2X$ or $3X$ (e.g., `16px` or `24px`).
- **Screen Padding**:
  - Horizontal screen gutters: `16px` (compact) or `20px` (comfortable).
  - Card internal padding: `16px – 24px`.
  - Major section vertical gap: `32px – 48px`.

#### 4. Tactile Depth & Shadows
- Use layered, diffuse shadows instead of harsh drop lines:
  - Soft elevation: `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.25);`
  - Subtle top inner rim catchlight: `inset 0 1px 0 rgba(255, 255, 255, 0.08);`
- In Neumorphic or continuous material designs, weld controls into the chassis with paired light/shadow extrusions.

#### 5. Touch Targets & Ergonomics
- **Minimum Tap Target**: Every interactive element must be at least **$44 \times 44\,\text{pt}$** ($48 \times 48\,\text{px}$ recommended).
- Provide visual feedback on press: subtle compression (`active:scale-[0.97]`) and instant color/shadow shift.

---

## Step 4: Design for Emotion (Peak-End Rule)

Users remember two key moments of any mobile flow:
1. **The Peak Moment** (the emotional high point of task completion):
   - Example: Photo successfully exported, streak continued, payment settled.
   - Celebrate with tactile haptic-style micro-animations, crisp checkmark draws, spring pulses, and congratulatory copy.
2. **The Ending Moment** (the lasting impression left on the screen):
   - Clean summary card, clear next steps, or a frictionless route back to home.
   - Never strand the user on a dead screen after completing an action.

---

## Step 5: High-Impact Smart Mobile Patterns

| Pattern | Anti-Pattern (What to Avoid) | Best Practice (What to Implement) |
|---|---|---|
| **Smarter Search** | Blank empty screen when search input is focused | Display recent searches, trending tags, and category chips immediately upon focus. |
| **Selection over Input** | Forcing users to type out frequent categories or labels | Provide tappable pills/chips with contextual icons. Include "Other" as a fallback. |
| **Status Tracking** | Rigid text table of timestamps and logs | Visual timeline progress bar with active node pulse and friendly human status message. |
| **Category Cards** | Generic text lists with stock photography | Color-coded cards with soft tinted backgrounds, clean isolated icons, and clear counts. |
| **Undo Resilience** | Modal confirmation dialog ("Are you sure?") for every minor edit | Execute instantly and show a non-blocking toast at the bottom with an **Undo** button. |

---

## The 10 Banned Mobile Anti-Patterns

1. ❌ **CTAs out of thumb reach**: Putting primary actions at the top header where one-handed use fails.
2. ❌ **Microscopic tap targets**: $20\text{px}$ icon links without padding that frustrate touch interaction.
3. ❌ **More than 4 font sizes on a screen**: Cacophony of font scales destroying visual hierarchy.
4. ❌ **Arbitrary spacing values**: Random paddings like `p-[13px]`, `mt-[27px]` breaking the 8pt rhythm.
5. ❌ **Dead-end empty states**: "No items found" with zero explanation and no CTA to create or search.
6. ❌ **Sliders for precise entry**: Using sliders for exact numbers like phone numbers, prices, or dates.
7. ❌ **Pure harsh black shadows**: Casting `rgba(0,0,0,0.8)` hard-edged drop shadows on light or colored cards.
8. ❌ **Hidden core actions**: Stashing the main action under 3-dot overflow menus when there is ample screen space.
9. ❌ **Missing press feedback**: Buttons that do not react when tapped, leaving users unsure if their tap registered.
10. ❌ **Blocking alerts over smooth undo**: Forcing annoying confirmation popups instead of instant action + toast undo.

---

## Verification & Review Checklist

When writing or reviewing mobile screens, verify:
- [ ] Base viewport tested against $375\,\text{px}$ (iPhone SE / compact baseline).
- [ ] Primary CTA positioned within the lower $35\%$ of the screen (Thumb Zone).
- [ ] All interactive elements measure at least $44 \times 44\,\text{pt}$ touch area.
- [ ] No more than 4 font sizes and 2 font weights used on the screen.
- [ ] Numeric metrics and tabular figures formatted with `tabular-nums` / monospace.
- [ ] Spacing values adhere to the 8pt grid (`4, 8, 12, 16, 24, 32, 48, 64, 80`).
- [ ] Shadows are soft, diffuse, and tinted to the ambient background chassis.
- [ ] Micro-interactions respond instantly with active press feedback (`scale(0.97)`).
- [ ] Empty, error, loading, and completed peak states are accounted for.
