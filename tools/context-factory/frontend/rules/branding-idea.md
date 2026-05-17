# Bagyo Rescue Brand Idea

This document is the working creative brief for Bagyo Rescue. Use it to direct copy, layout, UI, and visual decisions. It overrides any leftover Dianoia Tech direction.

## Identity

Bagyo Rescue is a rescue line, not a product.

It is calm under pressure. It is built for the worst day of someone's year. It is trusted by both a barangay captain triaging a long queue of reports and by a scared resident watching water rise inside their living room.

We are useful before we are beautiful. We are quiet before we are clever. We never get in the way of someone asking for help.

## Mission

Get the right people to the right address fast, even when the network is bad and the person asking is afraid.

## Archetypes

- **Guardian** (primary). We protect. We hold the line. We are the steady voice in the room when everything else is shouting.
- **Helper** (secondary). We do the work. We carry the load. We are present and practical, not inspirational.

We are not the Mentor. We do not teach.
We are not the Builder. We do not inspire.
We do not perform. We respond.

## Audiences

### Resident (Tagalog-primary)

- May be a lola who has never opened an app before today.
- May be on a 3-year-old Android, on 2G, in the dark, with a wet screen.
- May be panicked, one-handed, holding a child with the other arm.
- May not finish high school English.
- Will only use the app for minutes per year, almost always in an emergency.

Design for this person. If a screen confuses her, the design is broken.

### Coordinator / LGU admin (English-primary, plain words)

- Trained user. Logs in for full shifts during a storm.
- Triages dozens or hundreds of reports.
- Needs scan-ability, clear priority, and a single obvious next action per row.
- Tolerates density but not noise. Will not tolerate ambiguity about life-safety status.

## Tone Of Voice

- Direct. "Nasaan ka?" not "Let's get you sorted!"
- Warm but never cute. Never playful, never branded, never marketed.
- Imperatives are fine when they save time. "Pindutin para humingi ng tulong." "Sabihin sa amin kung ilan kayo."
- Never alarmist. We are the calm person on the phone.
- Plain words always. "Tulong" not "assistance request." "Tao" not "individual." "Bahay" not "household unit."
- No marketing language. No "we" voice in resident copy — the app speaks to the resident, not about itself.
- No emoji in product copy. Ever.
- No exclamation points except on the SOS confirmation: "Naipadala. May darating na tulong."

## Bilingual Rule

- **Resident surfaces**: Tagalog primary, larger; English secondary, smaller, below.
- **Coordinator/admin surfaces**: English primary, plain words. No Tagalog subtitle required.
- **Shared chrome (header, errors visible to both)**: Tagalog primary on resident routes, English primary on coordinator routes.

Translation infrastructure is out of scope. Inline both strings in JSX.

## Visual Vibe

Clear daylight. High contrast. Generous tap targets. Almost no decoration.

The app should read as a public utility, not a startup. Closer in spirit to gov.uk or Singapore SingPass done right than to a consumer SaaS. We borrow government-services discipline: one job per screen, plain typography, big touch surfaces, no ornament that isn't doing work.

Light by default. No dark mode toggle in v1 (dark tokens defined but dormant — emergency responders are usually outdoors in daylight).

## What We Never Do

- Gradients
- Glassmorphism, frosted blur, glow
- Hero illustrations of storms, waves, rain, broken houses
- Dark mode by default
- Modals or dialogs that block emergency actions
- "Skeleton" loaders longer than 1 second on resident screens
- English-only resident screens
- Jargon on resident surfaces ("triage", "queue", "dispatch", "incident", "ticket")
- Tabs of more than four
- Carousels
- Toast notifications for life-safety status changes
- Emoji in product copy
- Stock photography
- Animated transitions on the SOS button

## What We Always Do

- Tagalog first on resident screens, English below
- Plain English on coordinator screens
- Tap targets ≥48px on resident surfaces, ≥40px on coordinator
- One primary action per screen — visually obvious in under one second
- Show offline state honestly ("Naka-offline — ipapadala kapag may signal")
- Save resident input to the device immediately, sync later
- Tell the user what just happened in their language

## Color Direction

- **Rescue (blue)** — primary action and trust. Confident, not navy, not teal.
- **Signal (amber)** — attention and pending. Never used for primary CTAs.
- **Safe (green)** — resolved, received, "you're safe."
- **Danger (red)** — SOS, critical priority, destructive confirms. Reserved. Never decorative.
- **Slate (neutral)** — structure, text, surface.

See `branding-token-spec.md` for exact values.

## Typography Direction

- **Outfit** — display only. App wordmark, the single resident hero CTA. Nothing else.
- **Inter** — everything else. Inter has Filipino diacritical coverage and is already partially in use.

Self-hosted via Fontsource. We do not load from Google's CDN because residents may be on metered or blocked networks.

## Tagline Territory

- Tulong na, hindi mamaya.
- Pindutin. Darating kami.
- Para sa pamilya mo, kahit walang signal.

(Use sparingly. We do not need a tagline in product chrome.)

## One-Sentence Summary

Bagyo Rescue is the calm, plain-language rescue line Filipino families and LGUs reach for when the storm hits and there is no time to learn an app.
