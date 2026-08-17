---
name: Webmend
description: A reliable orchestration layer for Bright Data scrapers.
colors:
  primary: "#610010"
  crimson-deep: "#8B001C"
  forest-pro: "#1A3A32"
  background: "#fdf9f1"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f7f3eb"
  on-surface: "#1c1c17"
  on-primary: "#ffffff"
typography:
  display:
    fontFamily: "Bricolage Grotesque"
    fontSize: "56px"
    fontWeight: 800
    letterSpacing: "-0.04em"
    lineHeight: "60px"
  headline:
    fontFamily: "Bricolage Grotesque"
    fontSize: "36px"
    fontWeight: 700
    letterSpacing: "-0.02em"
    lineHeight: "44px"
  body:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
  label:
    fontFamily: "Space Grotesk"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "0.04em"
    lineHeight: "16px"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.5rem"
  xl: "0.75rem"
spacing:
  grid-margin: "2.5rem"
  element-gap: "1rem"
  container-padding: "2rem"
  grid-gutter: "1.5rem"
  tile-padding: "1.75rem"
components:
  bento-card:
    backgroundColor: "{colors.surface-container-lowest}"
    rounded: "{rounded.xl}"
    padding: "{spacing.tile-padding}"
  bento-card-primary:
    backgroundColor: "{colors.forest-pro}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.tile-padding}"
  bento-card-accent:
    backgroundColor: "{colors.crimson-deep}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.tile-padding}"
---

# Design System: Webmend

## 1. Overview

**Creative North Star: "The Crimson Terminal"**

This visual system translates technical credibility into a dense, highly functional "hacker archive" aesthetic. It rejects generic SaaS tropes in favor of raw data visibility, strong border boundaries, and deep, saturated accents. It explicitly avoids gradient washes, over-rounded "ghost cards", and generic Inter font pairings.

**Key Characteristics:**
- Dense, data-rich Bento grid layout
- Strong 2px borders defining boundaries instead of drop shadows
- High-contrast, saturated accents against a warm technical background

## 2. Colors

The palette is anchored by deep, confident technical tones rather than generic brights.

### Primary
- **Crimson Deep** (#8B001C): The core accent. Used for alerts, active states, and critical paths.
- **Forest Pro** (#1A3A32): The secondary structural tone. Used for active collectors and stable health metrics.

### Neutral
- **Background** (#fdf9f1): Warm technical parchment.
- **Surface Lowest** (#ffffff): Card backgrounds.
- **On Surface** (#1c1c17): Primary text ink.

**The Committed Ink Rule.** Neutrals carry a slight warmth, but text is aggressively dark for maximum >4.5:1 contrast. No "elegant light gray" body text.

## 3. Typography

**Display Font:** Bricolage Grotesque
**Body Font:** Plus Jakarta Sans
**Label/Mono Font:** Space Grotesk

**Character:** A highly technical, mono-forward pairing. Grotesque headlines provide authority, while Space Grotesk labels give it the "terminal log" feel.

### Hierarchy
- **Display** (800, 56px, 60px): Core hero numbers.
- **Headline** (700, 36px, 44px): Dashboard section headers.
- **Body** (500, 16px, 24px): Standard text blocks and tables.
- **Label** (600, 14px, 0.04em spacing): Data keys, metadata, and tags.

## 4. Elevation

The system is unapologetically flat. Structural separation is achieved through explicit borders, not shadows.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Depth is conveyed via 2px solid borders (e.g., `border-forest-pro`) rather than box shadows.

## 5. Components

Components prioritize dense functionality.

### Bento Cards
- **Corner Style:** 0.75rem (`xl`)
- **Background:** White (`surface-container-lowest`), Forest Pro, or Crimson Deep depending on the variant.
- **Border:** 2px solid border matching the accent color.
- **Internal Padding:** 1.75rem (`tile-padding`)

### Action Buttons
- **Shape:** Full pill (`9999px` radius)
- **Primary:** Crimson Deep background, White text.
- **Hover:** Gentle scale (`scale-105`), no layout shifts.

### Labels & Metadata
- **Style:** Space Grotesk, uppercase tracking (`0.04em`), dense and compact.

## 6. Do's and Don'ts

### Do:
- **Do** use Bricolage Grotesque for headlines and Space Grotesk for technical labels.
- **Do** wrap cards in explicit 2px solid borders.
- **Do** use deep saturated colors (Forest Pro, Crimson Deep) for active areas.

### Don't:
- **Don't** use Inter font or generic SaaS typography.
- **Don't** use purple-to-blue gradients anywhere.
- **Don't** nest cards within cards.
- **Don't** rely on soft `box-shadow` for separation—use explicit borders instead.
