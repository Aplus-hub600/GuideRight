# GuideRight Demo Script

**Audience:** Foreign Service Officer (State Department), Military Intelligence Officer
**Duration:** 15-20 minutes
**Setup:** Full screen browser, satellite map view pre-loaded

---

## OPENING (2 min)

**[Start on the main map view, satellite mode]**

> "GuideRight is a multimodal intelligence assistant built for operators and analysts who need actionable situational awareness - not another dashboard to stare at. It fuses open-source intelligence, population data, infrastructure mapping, and AI-driven analysis into a single operational picture."

> "Everything you see here is keyboard-navigable. This was designed for fast-paced field environments where mouse precision isn't always available."

---

## ACT 1: THE MAP AS AN OPERATING PICTURE (4 min)

### Map Styles
- Click **Sat** (top-left) to show satellite imagery
- Click **Hyb** to show hybrid with labels
- Click **Map** for terrain/roads view
- *Mention:* "Ctrl+M, Ctrl+S, Ctrl+H for keyboard switching"

### Area of Interest
- Click on the map to set an AOI (blue marker with halo ring appears)
- *Say:* "The blue marker with the surrounding ring is our Area of Interest. Everything the system analyzes anchors to this location."

### Zoom Context
- Use **+/-** buttons (bottom-left) to zoom
- *Point out* the zoom level indicator (z12, z13, etc.)
- *Say:* "The system adapts its analysis granularity to the zoom level - strategic overview at z6, tactical detail at z14."

---

## ACT 2: INTELLIGENCE LENSES (5 min)

*Switch between lenses using the lens selector on the right panel or keyboard shortcuts*

### Infrastructure Lens (Shift+F)
- Colored square markers appear: **+** (hospitals, red), **T** (transport, blue), **G** (government, purple), **U** (utilities, amber), **E** (education, cyan)
- Click any marker to see details
- *Say:* "We map critical infrastructure across six categories. For a Foreign Service Officer planning civil affairs engagement, this tells you where the leverage points are. For a J2, this is your critical asset overlay."

### Human Activity Lens (Shift+P)
- Population density grid appears as a heat-colored overlay
- *Say:* "This is a 40x40 grid representation of population density. We deliberately use muted colors and spatial patterns rather than precise numbers - the whitepaper principle of avoiding false precision."

**Demo the crosshair sampling:**
1. Press **G** to activate the crosshair
2. Use **Arrow keys** to navigate (Shift+Arrow for 3x speed)
3. Press **Enter** to sample a cell
4. *Point out* the density reading that appears
5. Press **Alt+P** to pin the sample
6. *Say:* "Operators can pin up to 10 density samples for briefing preparation. Each pin shows crowd potential, evacuation time estimates, and movement difficulty."

### Risk & Stress Lens (Shift+T)
- Threat overlay appears
- *Say:* "Risk assessment uses Dempster-Shafer confidence theory for multi-source fusion. We don't just say 'high risk' - we show you why, with source attribution and confidence intervals."

### Live Intel Lens (Shift+I)
- GDELT event markers appear (colored by Goldstein scale)
- Green = cooperation, Yellow = neutral, Orange = tension, Red = conflict
- Click an event for details (actors, event type, mentions)
- *Say:* "These are real-time events from the GDELT global event database. Color-coded by the Goldstein conflict-cooperation scale. Each marker is sized by media mention volume - bigger dots mean more coverage."

### Logistics Lens (Shift+L)
- Supply routes and access points
- *Say:* "Route exposure analysis uses qualitative assessments rather than precise risk scores. Movement corridors are color-coded from green through amber to red."

---

## ACT 3: AI-POWERED ANALYSIS (4 min)

### Chat Assistant
- Open the chat panel (right side)
- Type a query like: **"What are the primary security concerns for this area?"**
- *Wait for AI response*
- *Say:* "The assistant has full context of the current AOI, active lens, and any data on the map. It doesn't just answer generically - it grounds responses in the operational picture."

### Quick Actions (Alt+1 through Alt+5)
Demonstrate the one-key tactical queries:
- **Alt+1** - PMESII Analysis (Political, Military, Economic, Social, Information, Infrastructure)
- **Alt+2** - Threat Assessment
- **Alt+3** - SITREP Generation
- **Alt+4** - Infrastructure Analysis
- **Alt+5** - HUMINT Assessment

*Say:* "Five pre-built analytical frameworks, each accessible with a single keystroke. A field operator can generate a PMESII brief in under 3 seconds."

### File Analysis
- Drag and drop an image or document into the chat
- *Say:* "GuideRight handles multimodal input - images, documents, video. It extracts metadata, analyzes content, and integrates findings into the operational picture."

---

## ACT 4: SUPPORTING PANELS (2 min)

### Analytics Dashboard
- Switch to the Analytics view from the sidebar
- *Point out:* Threat trend lines, operational data by location, system performance metrics
- *Say:* "Roll-up view for command staff. Trend analysis across threat categories with change indicators."

### Event Timeline
- Switch to the Timeline view
- *Show* filtering by event type and severity
- *Say:* "Chronological intelligence feed with severity filtering. Every event is tagged and searchable."

### Social Media Intelligence
- Switch to Social Media view
- *Say:* "Sentiment analysis and influencer tracking from open-source social media. Particularly relevant for information operations and civil affairs."

### Weather Intelligence
- Switch to Weather view
- *Say:* "Tactical weather integration. Wind, visibility, precipitation - all factors that affect operations planning."

---

## ACT 5: DESIGN PHILOSOPHY (2 min)

> "Three things make GuideRight different from what's already on the market:"

> "**First, it's agency-neutral.** This isn't built for one community. An FSO planning an embassy security review uses the same tool as a J2 building a threat assessment. The lenses adapt the picture to the mission."

> "**Second, keyboard-first design.** Every function is accessible without a mouse. In a TOC or a field environment, that matters. Shift+I for intel, Alt+1 for PMESII, G for grid sampling - operators learn the shortcuts in one session."

> "**Third, honest uncertainty.** We use muted colors, confidence intervals, and spatial patterns instead of precise-looking numbers that create false confidence. The system tells you what it doesn't know, not just what it does."

---

## CLOSING

> "GuideRight is mission-ready for operators, intel analysts, civil affairs, and information operations personnel. It runs in any browser, requires no installation, and integrates with existing intelligence feeds."

> "Questions?"

---

## KEYBOARD SHORTCUT QUICK REFERENCE

| Shortcut | Action |
|----------|--------|
| Ctrl+M / S / H | Map / Satellite / Hybrid |
| Shift+I | Live Intel lens |
| Shift+P | Human Activity lens |
| Shift+T | Risk & Stress lens |
| Shift+L | Logistics lens |
| Shift+F | Infrastructure lens |
| +/- | Zoom in/out |
| C | Center on AOI |
| G | Toggle crosshair |
| Arrow keys | Move crosshair |
| Shift+Arrow | Fast crosshair move |
| Enter | Sample density |
| Alt+P | Pin density sample |
| Alt+1-5 | Quick tactical queries |
| Escape | Clear/cancel |
