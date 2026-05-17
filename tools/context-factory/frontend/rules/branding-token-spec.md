# Bagyo Rescue Branding Token Spec

This is the source of truth for color, typography, spacing, radius, motion, and elevation in the Bagyo Rescue web app. Components must consume the **semantic tokens** below — never the raw ramps, never literal hex or px values.

Pair with `branding-idea.md` for tone and audience direction.

## Design Intent

- Light by default. Dark tokens defined but dormant.
- High contrast. AA floor for all text, AAA for SOS and any label on a fill of `danger` or `signal`.
- Flat. One shadow token exists. No gradients.
- Generous tap targets, especially on resident surfaces.
- Calm hierarchy. Typography carries weight, not decoration.

## Color Ramps

All ramps are 9 stops, OKLCH-defined to keep perceptual lightness even. Components must not consume these directly — use the **semantic tokens** below.

### Rescue (blue, primary action, trust)

Mid stop near `#1B6FE3`.

```
--color-rescue-50:  oklch(0.975 0.014 250)
--color-rescue-100: oklch(0.945 0.034 250)
--color-rescue-200: oklch(0.890 0.070 250)
--color-rescue-300: oklch(0.810 0.115 252)
--color-rescue-400: oklch(0.700 0.165 255)
--color-rescue-500: oklch(0.595 0.195 258)   /* ≈ #1B6FE3 */
--color-rescue-600: oklch(0.520 0.205 260)
--color-rescue-700: oklch(0.450 0.190 262)
--color-rescue-800: oklch(0.380 0.160 264)
--color-rescue-900: oklch(0.300 0.120 266)
```

### Signal (amber, attention, pending)

Mid stop near `#F59E0B`.

```
--color-signal-50:  oklch(0.980 0.022 85)
--color-signal-100: oklch(0.950 0.060 85)
--color-signal-200: oklch(0.905 0.110 82)
--color-signal-300: oklch(0.855 0.150 78)
--color-signal-400: oklch(0.810 0.170 72)
--color-signal-500: oklch(0.760 0.175 66)   /* ≈ #F59E0B */
--color-signal-600: oklch(0.680 0.165 60)
--color-signal-700: oklch(0.580 0.140 55)
--color-signal-800: oklch(0.480 0.115 50)
--color-signal-900: oklch(0.380 0.090 48)
```

### Safe (green, resolved, received)

Mid stop near `#16A34A`.

```
--color-safe-50:  oklch(0.975 0.020 150)
--color-safe-100: oklch(0.945 0.050 150)
--color-safe-200: oklch(0.890 0.095 148)
--color-safe-300: oklch(0.815 0.140 146)
--color-safe-400: oklch(0.720 0.170 145)
--color-safe-500: oklch(0.625 0.170 145)   /* ≈ #16A34A */
--color-safe-600: oklch(0.545 0.155 145)
--color-safe-700: oklch(0.465 0.130 146)
--color-safe-800: oklch(0.395 0.105 147)
--color-safe-900: oklch(0.320 0.080 148)
```

### Danger (red, SOS, critical)

Mid stop near `#DC2626`. Reserved. Never decorative.

```
--color-danger-50:  oklch(0.975 0.018 25)
--color-danger-100: oklch(0.945 0.045 25)
--color-danger-200: oklch(0.890 0.090 25)
--color-danger-300: oklch(0.810 0.140 26)
--color-danger-400: oklch(0.700 0.190 28)
--color-danger-500: oklch(0.595 0.225 29)   /* ≈ #DC2626 */
--color-danger-600: oklch(0.520 0.215 30)
--color-danger-700: oklch(0.450 0.190 30)
--color-danger-800: oklch(0.380 0.160 30)
--color-danger-900: oklch(0.305 0.130 30)
```

### Slate (neutral, structure, text, surface)

```
--color-slate-50:  oklch(0.985 0.003 248)
--color-slate-100: oklch(0.965 0.005 248)
--color-slate-200: oklch(0.920 0.008 248)
--color-slate-300: oklch(0.860 0.010 248)
--color-slate-400: oklch(0.730 0.012 248)
--color-slate-500: oklch(0.590 0.014 248)
--color-slate-600: oklch(0.475 0.014 248)
--color-slate-700: oklch(0.375 0.012 248)
--color-slate-800: oklch(0.275 0.010 248)
--color-slate-900: oklch(0.180 0.008 248)
```

## Semantic Tokens

Components consume **only** these.

### Surfaces and borders

```
--color-bg:               --color-slate-50
--color-surface:          #ffffff
--color-surface-raised:   #ffffff
--color-surface-muted:    --color-slate-100
--color-border:           --color-slate-200
--color-border-strong:    --color-slate-300
```

### Text

```
--color-text:             --color-slate-900
--color-text-muted:       --color-slate-600
--color-text-soft:        --color-slate-500
--color-text-on-primary:  #ffffff
--color-text-on-danger:   #ffffff
--color-text-on-signal:   --color-slate-900   /* amber needs dark text for AAA */
--color-text-on-safe:     #ffffff
```

### Primary

```
--color-primary:          --color-rescue-500
--color-primary-hover:    --color-rescue-600
--color-primary-pressed:  --color-rescue-700
--color-primary-soft:     --color-rescue-50
```

### Danger

```
--color-danger:           --color-danger-500
--color-danger-hover:     --color-danger-600
--color-danger-pressed:   --color-danger-700
--color-danger-soft:      --color-danger-50
```

### Signal and safe

```
--color-signal:           --color-signal-500
--color-signal-soft:      --color-signal-50
--color-safe:             --color-safe-500
--color-safe-soft:        --color-safe-50
```

### Focus ring

Must reach 3:1 against any surface it appears on.

```
--color-focus-ring:       --color-rescue-400
```

### Priority tokens (rescue reports)

```
--color-priority-critical: --color-danger-600
--color-priority-high:     --color-signal-600
--color-priority-medium:   --color-slate-500
--color-priority-low:      --color-slate-400
```

### Status tokens (rescue reports)

```
--color-status-new:        --color-rescue-500
--color-status-triaged:    --color-signal-500
--color-status-responding: --color-rescue-600
--color-status-resolved:   --color-safe-500
```

## Typography

### Families

```
--font-display: "Outfit", ui-sans-serif, system-ui, sans-serif
--font-sans:    "Inter",  ui-sans-serif, system-ui, sans-serif
```

- **Outfit** (700) — wordmark and the resident SOS hero CTA. Nothing else.
- **Inter** (400/500/600/700) — everything else. Has Filipino diacritical coverage.

Self-hosted via `@fontsource/outfit` and `@fontsource/inter`. Do not load from Google's CDN — residents may be on metered or blocked networks.

### Scale

`rem`-based. `clamp()` is used only on the resident SOS hero.

```
display-2xl  clamp(2.5rem, 6vw, 3.5rem) / 1.05 / 700   /* resident SOS CTA only */
display-lg   2rem      / 1.10 / 700                    /* section heroes */
heading-lg   1.5rem    / 1.20 / 600
heading-md   1.25rem   / 1.25 / 600
body-lg      1.125rem  / 1.50 / 400                    /* resident default */
body-md      1rem      / 1.50 / 400                    /* coordinator default */
label-md     0.875rem  / 1.40 / 500
caption      0.75rem   / 1.40 / 500                    /* never action-relevant on resident */
```

## Spacing

Use **only** these values. Tailwind utilities map to them.

```
0     0
0.5   0.125rem
1     0.25rem
2     0.5rem
3     0.75rem
4     1rem
6     1.5rem
8     2rem
12    3rem
16    4rem
24    6rem
32    8rem
```

## Radius

```
--radius-sm:    0.5rem
--radius-md:    0.75rem
--radius-lg:    1rem      /* SOS and primary resident buttons: lg minimum */
--radius-xl:    1.5rem
--radius-pill:  9999px
```

## Tap Targets

- **Resident surfaces**: minimum **48×48px** for any interactive element.
- **Coordinator/admin surfaces**: **40×40px** acceptable.
- The resident SOS hero is **≥96px tall** and reaches both thumbs in any common phone grip.

## Motion

```
--duration-micro:   120ms
--duration-base:    200ms
--duration-entrance: 320ms
--ease-standard:    cubic-bezier(0.2, 0.8, 0.2, 1)
```

Rules:

- No motion on the SOS button. Ever.
- No motion on critical-priority badges or status changes.
- Respect `prefers-reduced-motion: reduce` — disable all non-essential transitions.

## Elevation

Flat by default. One shadow exists.

```
--shadow-raised: 0 1px 2px rgba(15, 23, 42, 0.06),
                 0 1px 3px rgba(15, 23, 42, 0.08);
```

No `--shadow-md`. No `--shadow-lg`. If you reach for a deeper shadow, you are in the wrong direction.

## Contrast Floor

- All text: WCAG AA (4.5:1 for body, 3:1 for large text).
- SOS button label and any text on `--color-danger` or `--color-signal` fills: AAA (7:1 / 4.5:1 large).
- Focus ring: 3:1 against any surface it may appear on.

## Don'ts

| Forbidden                                    | Why                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------- |
| Literal hex in a component                   | Tokens exist for a reason. Migrate, don't shortcut.                 |
| Literal px in a component (use spacing/size) | Token scale exists for a reason.                                    |
| Teal `#0f766e`                               | Legacy. Not in this brand. Anywhere it appears is a migration miss. |
| Blue `#128ee8` or `#0c75c6`                  | Legacy Dianoia blue. Use `--color-primary` (rescue).                |
| DM Sans                                      | Replaced by Inter for Filipino diacritical coverage.                |
| Google Fonts CDN                             | Residents may be on metered or blocked networks. Self-host.         |
| Font sizes outside the scale                 | Erodes hierarchy.                                                   |
| Shadows beyond `--shadow-raised`             | Flat brand. Reach for borders, not depth.                           |
| Gradients                                    | Anti-brand.                                                         |
| Glassmorphism, frosted blur                  | Anti-brand.                                                         |
| `--color-danger` for decoration              | Danger is reserved for SOS / critical / destructive confirm.        |
| `--color-signal` on a primary CTA            | Amber means "needs attention," not "do this."                       |
| Tap targets < 48px on resident surfaces      | Misses the lola persona.                                            |
| Long skeleton loaders on resident screens    | If it can't render in <1s, show plain text, not a placeholder.      |
| Emoji in product copy                        | Not in this brand.                                                  |
| English-only resident copy                   | Tagalog must be primary on resident surfaces.                       |
