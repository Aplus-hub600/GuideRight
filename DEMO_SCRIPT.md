# GuideRight Demo Script

**Audience:** Foreign Service Officer (State Department), Military Intelligence Officer  
**Duration:** 15-20 minutes  
**Setup:** Full screen browser, roadmap view pre-loaded on Dhaka, Bangladesh

---

## OPENING (2 min)

**[Start on the main map view, roadmap mode]**

> "GuideRight is a multimodal intelligence assistant built for operators and analysts who need actionable situational awareness — not another dashboard to stare at. It fuses open-source intelligence, population data, infrastructure mapping, and AI-driven analysis into a single operational picture."

> "Everything you see here is keyboard-navigable. This was designed for fast-paced field environments where mouse precision isn't always available."

---

## ACT 1: THE MAP AS AN OPERATING PICTURE (4 min)

### Map Styles
- Click **Sat** (top-left) to show satellite imagery — *best first impression*
- Click **Hyb** for hybrid with road labels overlaid
- Click **Map** for terrain/roads view
- *Mention:* "Ctrl+M, Ctrl+S, Ctrl+H for keyboard switching — no mouse required."

### Area of Interest
- Click anywhere on the map to set an AOI (blue marker with halo ring appears)
- *Say:* "The blue marker with the surrounding ring is our Area of Interest. Every analysis the system generates anchors to this location."

### Zoom Context
- Use **+/-** buttons (bottom-left) to zoom
- *Point out* the zoom level indicator (z12, z13, etc.)
- *Say:* "The system adapts analysis granularity to zoom level — strategic overview at z6, tactical detail at z14."

---

## ACT 2: INTELLIGENCE LENSES (6 min)

*Use the lens selector or keyboard shortcuts to switch views*

### Infrastructure Lens — **Shift+F** ← START HERE

**[The map automatically switches to satellite when you activate this lens]**

- Colored circle markers with recognizable icons appear on the imagery:
  - **Red circle / medical cross** — hospitals and healthcare
  - **Blue circle / plane or rail tracks or anchor** — transport (sub-category specific icons)
  - **Purple circle / building columns** — government facilities
  - **Amber circle / lightning bolt or water drop** — utilities (power/water)
  - **Cyan circle / graduation cap** — education

- **Verified nodes** (26px+, pulsing glow ring) are the largest and brightest — your eye goes to them first
- **Single-source nodes** (22px, half glow) — treat with caution
- **Inferred nodes** (16px, faint) — present but uncertain

- **Hover any marker** to reveal the facility name — the map stays clean until you need it
- **Click any marker** to open the full detail card: sub-category, confidence level, source count, operational notes

- *Say for FSO:* "For a Foreign Service Officer planning a civil affairs engagement, this tells you where the leverage points are — medical facilities for humanitarian access, government buildings for engagement, utilities for infrastructure diplomacy."
- *Say for MI:* "For a J2, this is your critical asset overlay. Dual-use infrastructure, chokepoints, degradable nodes — all in one picture."

- **Notice:** All other map markers (AOI ring, SigAct incidents) fade to 20% when this lens is active. The only thing speaking is infrastructure.

### Human Activity Lens — **Shift+P**

- Population density grid appears as a heat-colored overlay (40×40 cells)
- *Say:* "This is a 40×40 grid of population density. We deliberately use spatial patterns rather than precise numbers — the system shows you *where* people concentrate, not false precision about *how many*."

**Demo the crosshair sampling:**
1. Press **G** to activate the crosshair (cyan reticle with coordinate label)
2. Use **Arrow keys** to navigate (Shift+Arrow for 3× speed)
3. Press **Enter** to sample a cell
4. *Point out* the density card: crowd potential (CRITICAL/HIGH/MODERATE/LOW), evacuation time estimate, movement difficulty rating
5. Press **Alt+P** to pin the sample
6. *Say:* "Operators can pin up to 10 samples for briefing prep. Each pin shows the tactical read for that grid cell."

### Risk & Stress Lens — **Shift+T**

- Colored circles appear over the map (Sadarghat Port, Old Dhaka, University District, etc.)
- High/Elevated zones have a pulsing dot and color-coded risk badge
- Click any zone label to expand the detail card
- *Say:* "Risk assessment uses Dempster-Shafer confidence theory for multi-source fusion. We show you why a zone is rated high, not just that it is — with source attribution and confidence intervals."

### Live Intel Lens — **Shift+I**

- GDELT event markers appear, sized by media mention volume, colored by Goldstein scale:
  - Green = cooperation events
  - Yellow = neutral
  - Orange = tension
  - Red = conflict
  - Dark red = severe conflict
- Click any event for actors, event type, and mention count
- *Say:* "Real-time events from the GDELT global event database. Bigger markers mean more media coverage — a rough proxy for operational significance."

### Logistics Lens — **Shift+L**

- Traffic and route data overlay
- *Say:* "Route exposure analysis. Movement corridors color-coded by congestion and access difficulty."

---

## ACT 3: AI-POWERED ANALYSIS (4 min)

### Chat Assistant

- Open the chat panel (right side)
- Type: **"What are the primary security concerns for this area?"**
- *Wait for AI response*
- *Say:* "The assistant has full context of the current AOI, active lens, and all data on the map. Responses are grounded in the operational picture, not generic."

### Quick Actions — **Alt+1 through Alt+5**

*One-keystroke tactical analysis frameworks:*

| Shortcut | Framework |
|----------|-----------|
| Alt+1 | PMESII Analysis (Political, Military, Economic, Social, Information, Infrastructure) |
| Alt+2 | Threat Assessment |
| Alt+3 | SITREP Generation |
| Alt+4 | Infrastructure Analysis |
| Alt+5 | HUMINT Assessment |

*Say:* "Five pre-built analytical frameworks, each accessible with a single keystroke. A field operator generates a PMESII brief in under 3 seconds."

### File Analysis

- Drag and drop an image or document into the chat
- *Say:* "GuideRight handles multimodal input — images, documents, video. It extracts metadata, analyzes content, and integrates findings directly into the operational picture."

---

## ACT 4: SUPPORTING PANELS (2 min)

### Analytics Dashboard
- Switch to Analytics from the sidebar
- *Point out:* Threat trend lines, operational data by location, system performance metrics
- *Say:* "Roll-up view for command staff. Trend analysis across threat categories."

### Event Timeline
- Switch to Timeline view
- *Show* filtering by event type and severity
- *Say:* "Chronological intelligence feed. Every event tagged and searchable."

### Social Media Intelligence
- Switch to Social Media view
- *Say:* "Sentiment analysis and influencer tracking from open-source social media. Directly relevant for IO and civil affairs."

### Weather Intelligence
- Switch to Weather view
- *Say:* "Tactical weather integration — wind, visibility, precipitation — all factors in operations planning."

---

## ACT 5: DESIGN PHILOSOPHY (2 min)

> "Three things make GuideRight different from what's already on the market:"

> "**First, agency-neutral.** This isn't built for one community. An FSO planning an embassy security review uses the same tool as a J2 building a threat assessment. The lenses adapt the picture to the mission."

> "**Second, keyboard-first.** Every function is accessible without a mouse. In a TOC or a field environment, that matters. Shift+I for intel, Alt+1 for PMESII, G for grid sampling — operators learn the shortcuts in one session."

> "**Third, honest uncertainty.** We encode confidence visually. Verified infrastructure nodes are large and bright. Inferred data is small and faint. The system tells you what it doesn't know, not just what it does — and it never gives you false precision."

---

## CLOSING

> "GuideRight is mission-ready for operators, intel analysts, civil affairs, and information operations personnel. It runs in any browser, requires no installation, and integrates with existing intelligence feeds."

> "Questions?"

---

## KEYBOARD SHORTCUT REFERENCE

| Shortcut | Action |
|----------|--------|
| Ctrl+M / S / H | Map / Satellite / Hybrid |
| Shift+I | Live Intel lens |
| Shift+P | Human Activity lens |
| Shift+T | Risk & Stress lens |
| Shift+L | Logistics lens |
| Shift+F | Infrastructure lens (auto-switches to satellite) |
| +/- | Zoom in/out |
| C | Center on AOI |
| G | Toggle crosshair |
| Arrow keys | Move crosshair |
| Shift+Arrow | Fast crosshair move (3×) |
| Enter | Sample density cell |
| Alt+P | Pin density sample |
| Alt+1-5 | Quick tactical queries |
| Escape | Clear/cancel |

---

## AUDIENCE-SPECIFIC TALKING POINTS

### For the Foreign Service Officer (State Dept)
- Infrastructure lens → civil affairs leverage points, humanitarian access corridors
- Human activity → population displacement patterns, civilian concentration zones
- Risk zones → protest likelihood, political instability indicators
- AI chat → "What are the civil society networks active in this area?"

### For the Military Intelligence Officer (J2)
- Infrastructure lens → critical asset overlay, dual-use nodes, degradable chokepoints
- Intel lens → GDELT conflict events, actor mapping
- Risk zones → Dempster-Shafer confidence modeling, multi-source fusion
- PMESII quick action → structured analytical framework in one keystroke
- "The confidence encoding is deliberate — the system forces you to interrogate inferred data before acting on it."
