---
name: impeccable
description: >-
  The "Design Language & Frontend Polish" skill. Enforces world-class UI design, consistent design tokens,
  impeccable typography, perfect visual hierarchy, responsive layouts, and interactive state feedback.
---

# Impeccable — Design Language & Frontend Polish Skill

> "Great design is not just what it looks like and feels like. Design is how it works and how it delights."

## Core Principles

### 1. Visual Hierarchy & Composition
- **Clear Information Density**: Use balanced padding, purposeful white space, and clear structural separation (cards, dividers, subtle borders).
- **Dominant Focus**: Every screen and modal must have one unmistakable primary action and clear secondary actions.
- **Elevation & Depth**: Use layered glassmorphism, soft multi-layered drop shadows, and subtle border highlights rather than harsh block borders.

### 2. Typography & Contrast
- **Modern Typography Scales**: Use purposeful font sizes (`text-xs`, `text-sm`, `text-base`, `text-xl`) with crisp weights (`font-bold`, `font-semibold`, `font-mono` for metrics/IDs).
- **100% Contrast Compliance**: Text must always have high readability against its container in both **Dark Mode** and **Light Mode**.
- **No Washed-Out Text**: Avoid faint grays on white surfaces or dark slate on black surfaces.

### 3. Palette & Color Harmonies
- **Curated Accents**: Stick to purposeful brand accents (Electric Cyan, Sky Blue, Finance Emerald, Security Amber).
- **No Muddy Colors**: Avoid dull, conflicting, or unintended purple casts.
- **Semantic Consistency**: Green = Active/Success, Cyan/Blue = Primary Action/Info, Amber = Warning/Pending, Rose = Destructive/Error.

### 4. Interactive States & Micro-interactions
- **Hover & Active States**: Every clickable element (buttons, cards, table rows, nav links) must have responsive hover states (`hover:scale-[1.02]`, `transition-all`, active glow).
- **Loading & Empty States**: Provide elegant spinners or skeleton loaders and clear, helpful empty state messages with actionable buttons.
- **Smooth Modals & Overlays**: Full viewport coverage with frosted backdrop blur, proper z-index elevation, and smooth entrance transitions.

### 5. Responsive & Resilient Layouts
- Design mobile-first and fluid across all viewports (mobile, tablet, desktop, ultra-wide).
- Avoid layout shifts, clipped text, or overlapping elements.
