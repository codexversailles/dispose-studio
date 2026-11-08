# Skill: Anti-AI-Slop Web & UI Design Specialist (`anti-ai-slop-design`)

## Purpose

Enforce clean, human-crafted, high-taste frontend design and layout engineering. Actively identify and purge the clichéd, over-stylized, superficial design patterns commonly produced by LLMs, hype-driven templates, and boilerplate AI generators (the modern "AI startup / linear-cloned / devtools-slop" aesthetic).

---

## The 20 Anti-Patterns & Enforcement Rules

| # | Banned Anti-Pattern | Why It's Slop | Enforcement & Replacement Rule |
|---|---|---|---|
| **1** | **Tags & pills everywhere** | Sticking a pill badge (`rounded-full px-3 py-1 bg-white/5 border`) above every heading or on every list item produces visual noise. | Replace with semantic hierarchy: plain typographic headers, simple text labels, or whitespace separation. Use tags only for actual selectable filters or strict status indicators. |
| **2** | **Excessive italics** | Randomly italicizing every third keyword, quote, or slogan as faux-editorial sophistication. | Keep body and display typography Roman/normal. Reserve italics strictly for defined book/work titles, code foreign words, or contextual scientific/mathematical notation. |
| **3** | **Instrument Serif fetish** | Mindlessly defaulting to *Instrument Serif* (or *Editorial New*) for the hero H1 to fake an "editorial literary SaaS" aesthetic. | Choose authentic, intentional typefaces suited to the domain (e.g., modern grotesques, clean geo-sans, utilitarian humanist faces, or stout commercial serifs). Avoid viral font bandwagons. |
| **4** | **Negative kerning on body/subheads** | Aggressively slapping `tracking-tighter` (`letter-spacing: -0.05em`) across regular headings and small paragraphs makes text cramped and unreadable. | Restrict subtle negative tracking strictly to massive display titles (>48px, max `-0.02em`). Keep subheadings and body copy neutral (`tracking-normal`) or slightly loose for small UI (`tracking-wide` on micro-labels). |
| **5** | **Over-the-top detailed mock UI** | Cluttering landing pages with pseudo-IDEs, fake terminal windows, mock synthetic graphs, and faux glass panels that don't represent real software. | Display genuine product interfaces, crisp simplified schematics, or interactive live components with functional utility. Strip out unnecessary decorative UI chrome. |
| **6** | **Overusing dividers** | Placing 1px border lines (`border-t border-zinc-800`) between every tiny block, button group, card, and section. | Rely on intentional spatial rhythm (e.g., 8pt grid spacing scale: `gap-8`, `gap-12`, `mb-16`) to group and delineate content without slicing the page into a grid prison. |
| **7** | **Chaotic color shades & opacities** | Mixing `text-white/40`, `text-white/60`, `text-white/70`, `text-zinc-400`, `bg-white/[0.02]`, and `bg-white/[0.04]` haphazardly across one view. | Establish a strict 3-tier grayscale token system: Primary (`#EDEDED` or `zinc-100`), Secondary (`#A1A1AA` or `zinc-400`), and Subtle/Disabled (`#71717A` or `zinc-500`). Ban arbitrary opacity mixing. |
| **8** | **Containers with borders for everything** | Wrapping every single quote, metric, feature, or paragraph in an individual rounded box with an inset outline. | Let content breathe on the canvas. Group related elements using alignment and white space rather than boxing every thought into its own card. |
| **9** | **Overly detailed diagrams** | Inserting massive, convoluted SVG architecture diagrams with 40 glowing nodes and pulsing lines just to illustrate a simple two-step process. | Simplify diagrams to the essential data model. If an architecture chart takes longer than 3 seconds to parse, refactor it into structured prose or a high-level flowchart. |
| **10** | **Verbose, redundant text** | Fluffy copy like *"Revolutionize your collaborative workflow paradigms with hyper-scalable agentic intelligence."* | Write clear, declarative, human copy. State exactly what the product does, what inputs it takes, and what outcome it delivers. Cut buzzwords and empty adverbs. |
| **11** | **Code breadcrumbs in headers** | Faux-developer breadcrumbs on consumer/standard sites (e.g., `~/app/features/v2.4.0/overview.tsx`) used as decorative headers. | Use clear, standard navigation structures. Keep file paths strictly inside developer documentation or actual developer tools. |
| **12** | **Section numbering (`01 //`, `[02]`)** | Prepending section titles with brutalist or technical numbering prefixes (`01 / Architecture`, `[02] Pipeline`) without procedural order. | Write strong, self-explanatory section titles. Reserve numbers solely for sequential step-by-step guides, ordered lists, or documentation manuals. |
| **13** | **Eyebrow tags on every single block** | Placing a tiny uppercase subtitle (`FEATURES`, `CAPABILITIES`, `WHY US`) over every heading on the page. | Let the main heading carry its own weight. Only use eyebrow titles when switching broad architectural context across major sections. |
| **14** | **Gratuitous dithering** | Slapping retro 1-bit Bayer matrix or dithering shader overlays onto canvas backgrounds or photos purely to look "retro-tech." | Use clean photography, deliberate SVG vector illustrations, or solid architectural backgrounds. Avoid applying visual grain shaders as an aesthetic crutch. |
| **15** | **ASCII art & terminal novelties** | Inserting ASCII logos, box-drawing characters, and faux command-line prompts into standard business or product web apps. | Keep ASCII art in genuine CLI tooling, config headers, or easter eggs. Standard web apps should render crisp, accessible, scalable UI primitives. |
| **16** | **Obsessive squircle corners** | Complex nested super-ellipse curves applied indiscriminately to every button, avatar, card, and image container. | Standardize on consistent, predictable border-radius values (e.g., `rounded-lg` [8px] for buttons/inputs, `rounded-xl` [12px] for modal/dialog frames). Match inner radius to outer minus padding ($r_{\text{inner}} = r_{\text{outer}} - p$). |
| **17** | **Excessive monospace fonts** | Forcing numbers, body paragraphs, and navigation links into monospace (`font-mono`) to mimic a technical tool. | Confine monospace type strictly to code snippets, inline commands, cryptographic hashes, and tabular financial figures (`tabular-nums`). UI typography belongs in proportional sans or serif. |
| **18** | **ALL-CAPS SUBTITLES WITH ULTRA-WIDE TRACKING** | Writing subheadings in `uppercase tracking-[0.25em] text-[11px]` under every title. | Use standard sentence case for subheadings. Sentence case is significantly faster to read and feels confident rather than synthetic. |
| **19** | **Canned purple/teal radial gradient backgrounds** | The ubiquitous dark-mode "AI hero glow" (a top-centered glowing blur sphere in `#6366F1` or `#A855F7` on `#09090b`). | Rely on purposeful, structured surfaces. Use authentic background illumination, tactile light contrast, subtle borders, or solid rich surfaces without glowing vapor blobs. |
| **20** | **Periods in titles.** | Adding a final period to headings and hero titles (e.g., *"Ship software faster."*, *"The next platform."*). | Headings are titles, not sentences. Drop trailing periods on all H1–H4 display headers. Reserve periods for body paragraphs and multi-sentence captions. |

---

## Code Quality Benchmarks (Before vs. After)

### Example 1: Hero Section

#### The AI Slop Way (Forbidden)
```tsx
// ❌ AI SLOP: Pill tag, Instrument Serif, period in title, faux gradient blur, tracking-tighter
export function BadHero() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center overflow-hidden">
      {/* #19: Generic purple gradient blur */}
      <div className="absolute top-1/4 w-96 h-96 bg-purple-600/30 blur-[120px] rounded-full pointer-events-none" />
      
      {/* #1: Decorative pill tag */}
      <div className="rounded-full px-3 py-1 bg-white/5 border border-white/10 text-xs font-mono mb-6 text-zinc-400">
        ✨ NEXT-GEN V2.0 ENGINE
      </div>

      {/* #3 & #4 & #20: Instrument Serif, extreme negative kerning, trailing period */}
      <h1 className="font-serif italic text-6xl tracking-tighter max-w-2xl text-center">
        The complete intelligence layer.
      </h1>

      {/* #18: All caps wide tracked subtitle */}
      <p className="mt-4 uppercase tracking-[0.2em] text-xs text-zinc-400">
        DEPLOY INSTANT AGENTS ACROSS DISTRIBUTED RUNTIMES
      </p>
    </div>
  );
}
```

#### The Clean, Human-Crafted Way (Enforced)
```tsx
// ✅ CLEAN: Purposeful sans typography, confident hierarchy, natural spacing, no period
export function CleanHero() {
  return (
    <section className="relative min-h-[80vh] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-balance">
          Database migrations without downtime
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Zero-lock schema changes, automated rollback verification, and integrated audit logging for PostgreSQL clusters.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium text-sm hover:opacity-90 transition-opacity">
            Start 14-day trial
          </button>
          <button className="px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            Read documentation
          </button>
        </div>
      </div>
    </section>
  );
}
```

---

### Example 2: Metric / Feature Display

#### The AI Slop Way (Forbidden)
```tsx
// ❌ AI SLOP: Section numbering prefix, bordered boxes for each item, mono numbers everywhere
export function BadMetrics() {
  return (
    <div className="p-8 bg-zinc-950">
      <span className="text-zinc-500 font-mono text-xs">03 // ARCHITECTURE</span>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {items.map((item) => (
          // #8: Box with border around everything
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40">
            {/* #17: Monospace for regular text */}
            <p className="font-mono text-xs text-zinc-400">LATENCY_P99</p>
            <p className="font-mono text-3xl font-bold mt-2">1.2ms</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### The Clean, Human-Crafted Way (Enforced)
```tsx
// ✅ CLEAN: Open canvas, typographic scale, tabular numerals for figures
export function CleanMetrics() {
  return (
    <section className="py-16 max-w-5xl mx-auto px-6">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        System throughput
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">P99 latency</dt>
          <dd className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
            1.2 ms
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Global regions</dt>
          <dd className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
            34
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Availability SLA</dt>
          <dd className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
            99.99%
          </dd>
        </div>
      </dl>
    </section>
  );
}
```

---

## Agent Instructions for Design & Frontend Generation

When generating UI, website layouts, or component code under this skill:

1. **Conduct an Anti-Slop Audit**: Check headings for periods (drop them), check fonts (no reflexive Instrument Serif), and verify there are no fake pill tags above H1/H2 tags.
2. **Prioritize Space over Lines**: Group content with padding and margin tokens instead of wrapping everything in border-stroked cards or dividing with `<hr />` lines.
3. **Typography Discipline**: Reserve monospace for code blocks and tabular numbers. Use sentence case for all descriptions and subtitles.
4. **Authentic Lighting**: Avoid radial neon blurred circles behind headers unless a distinct 3D visual or brand asset explicitly requires it.