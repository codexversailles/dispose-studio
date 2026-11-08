# Disposé · Social Photo Dump Studio

> A Swiss-style minimalist photo collage & monthly calendar dump artboard editor built with React 19, TypeScript, Vite, Tailwind CSS, and Zustand.

![Disposé Studio Preview](public/favicon.svg)

## Features

- **Viral 7x5 Monthly Calendar Dump**: Full-bleed background wallpaper with a crisp framed days grid and date number toggles.
- **Canva-Style Resizing & Repositioning**:
  - Live interactive drag handles & edge pills for text boxes.
  - Repositionable photo grid with center snap guide lines (X/Y axis snapping).
- **Photoshop-Style Left Tool Dock**: Desktop docked sidebar and mobile bottom tool dock with Undo, Redo, Zoom, Grid Re-center, and Export triggers.
- **Deep Mobile Responsiveness**:
  - Auto-fitting canvas viewport with safe area offsets.
  - Slide-up bottom drawer Inspector panel with touch gestures.
- **Curated Typography**:
  - Arial Light (default), Arial, Ralphi Sans, Helvetica Neue, SF Pro Display, Instagram Sans, Inter, and JetBrains Mono with custom letter-spacing, sizing, colors, and shadows.
- **4K UHD Multi-Format Export**:
  - Instant PNG export up to 4K UHD (`2160 × 3840`, `pixelRatio: 6`) via `html-to-image`.
  - Native Web Share API integration on mobile devices.
- **Non-Destructive Gestures**: Smooth zoom and pan inside slots with auto-caching to IndexedDB (`idb-keyval`).

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion
- **State & History**: Zustand + Zundo (Undo/Redo) + IndexedDB
- **Export**: `html-to-image` + Canvas Confetti

## Getting Started

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build
```

## License

MIT
