# Dianoia Tech Branding Token Spec

This is a derived working token spec based on `tools/context-factory/shared/branding.md`.

Use it for frontend and brand exploration work in this repo. Stable brand decisions should still live in `brand-kit` when that package exists in the workspace.

## Design Intent

- light-first
- bright surfaces
- flat color
- restrained depth
- generous spacing
- calm hierarchy

## Typography Tokens

```css
--font-display: 'Outfit', sans-serif;
--font-body: 'DM Sans', sans-serif;
--font-ui: 'DM Sans', sans-serif;
```

### Type Roles

- `display-xl`: bold hero headline
- `display-lg`: page headline
- `heading-lg`: section title
- `heading-md`: card title
- `body-lg`: intro copy
- `body-md`: standard body text
- `body-sm`: helper text
- `label-md`: form labels and button text

## Core Palette

### Blue

- `blue-50`: `#eff7ff`
- `blue-100`: `#d7ebff`
- `blue-200`: `#afd8ff`
- `blue-300`: `#7cc0fb`
- `blue-400`: `#41a7f3`
- `blue-500`: `#128ee8`
- `blue-600`: `#0c75c6`
- `blue-700`: `#0f5ea0`
- `blue-800`: `#144d81`
- `blue-900`: `#173f67`

### Amber

- `amber-50`: `#fff8e5`
- `amber-100`: `#ffefbf`
- `amber-200`: `#ffe28a`
- `amber-300`: `#ffd04d`
- `amber-400`: `#ffc31f`
- `amber-500`: `#ffba00`
- `amber-600`: `#d99c00`
- `amber-700`: `#ad7c05`
- `amber-800`: `#8f660d`
- `amber-900`: `#755410`

### Green

- `green-50`: `#e9fff1`
- `green-100`: `#c8f9da`
- `green-200`: `#95f0b9`
- `green-300`: `#59e08f`
- `green-400`: `#1dd46a`
- `green-500`: `#00c951`
- `green-600`: `#00a944`
- `green-700`: `#00863a`
- `green-800`: `#0b6a33`
- `green-900`: `#0c562d`

### Slate

- `slate-50`: `#f8fafc`
- `slate-100`: `#f1f5f9`
- `slate-200`: `#e2e8f0`
- `slate-300`: `#cbd5e1`
- `slate-400`: `#94a3b8`
- `slate-500`: `#64748b`
- `slate-600`: `#475569`
- `slate-700`: `#334155`
- `slate-800`: `#1e293b`
- `slate-900`: `#0f172b`

## Semantic Tokens

```css
--color-bg: #f8fafc;
--color-surface: #ffffff;
--color-surface-muted: #f1f5f9;
--color-border: #e2e8f0;
--color-border-strong: #cbd5e1;

--color-text: #0f172b;
--color-text-muted: #475569;
--color-text-soft: #64748b;
--color-text-inverse: #ffffff;

--color-primary: #128ee8;
--color-primary-hover: #0c75c6;
--color-primary-soft: #d7ebff;

--color-accent: #ffba00;
--color-accent-hover: #d99c00;
--color-accent-soft: #fff8e5;

--color-success: #00c951;
--color-success-hover: #00a944;
--color-success-soft: #e9fff1;

--color-focus-ring: #41a7f3;
--color-danger: #dc2626;
--color-warning: #d99c00;
```

## UI Usage Rules

- Use `primary` for main CTAs, active states, and links.
- Use `accent` sparingly for highlights, badges, and moments of warmth.
- Use `success` for progress, completion, and earned positive states.
- Keep most layouts neutral and let brand colors act as emphasis.
- Prefer border separation over heavy shadows.

## Surface And Depth

```css
--radius-sm: 0.5rem;
--radius-md: 0.75rem;
--radius-lg: 1rem;
--radius-xl: 1.5rem;

--shadow-sm: 0 1px 2px rgba(15, 23, 43, 0.06);
--shadow-md: 0 6px 18px rgba(15, 23, 43, 0.08);
--shadow-lg: 0 12px 32px rgba(15, 23, 43, 0.1);
```

Depth should remain subtle. Cards should feel lifted, not floating.

## Motion

```css
--ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
--duration-fast: 120ms;
--duration-base: 180ms;
--duration-slow: 240ms;
```

Motion rules:

- keep transitions short
- use fades and gentle lift
- avoid dramatic scaling
- avoid decorative choreography

## Component Direction

Buttons:

- primary = blue fill with white text
- secondary = white or slate-50 surface with slate border
- accent = amber only when emphasis is intentional

Cards:

- white background
- subtle border
- mild shadow
- generous padding

Inputs:

- high contrast text
- quiet borders
- visible focus ring using blue

Badges:

- soft tinted backgrounds
- strong but not neon text color

## Creative Guardrails

Do:

- keep layouts open
- use whitespace generously
- rely on typography for hierarchy
- use color with intent

Do not:

- use gradients as a primary style
- use dark mode aesthetics as the default identity
- overanimate surfaces
- stack too many accents in one screen

## Starter CSS Example

```css
:root {
  --font-display: 'Outfit', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-ui: 'DM Sans', sans-serif;

  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-muted: #f1f5f9;
  --color-border: #e2e8f0;
  --color-text: #0f172b;
  --color-text-muted: #475569;
  --color-primary: #128ee8;
  --color-primary-hover: #0c75c6;
  --color-accent: #ffba00;
  --color-success: #00c951;
  --color-focus-ring: #41a7f3;

  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --shadow-sm: 0 1px 2px rgba(15, 23, 43, 0.06);
  --shadow-md: 0 6px 18px rgba(15, 23, 43, 0.08);
}
```
