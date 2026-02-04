# GuideRight Demo Script
## Urban Instability & Infrastructure Awareness in Dhaka, Bangladesh

**Duration:** 25-30 minutes  
**Audience:** Analysts, Program Managers, Evaluators

---

## Opening (2 min)

**Narrator:**
> "This demonstration shows how GuideRight supports analyst reasoning under uncertainty in complex urban environments. We're focusing on Dhaka, Bangladesh following a high-visibility political incident. Our core analytic question is: *What is the current risk posture across Dhaka, how confident are we in what we know, and where should analytic attention be focused over the next 48-72 hours?*"

**Key Point:** This is an analytic vignette - not an operational plan, mission rehearsal, or targeting activity.

---

## Step 1: Set the Area of Interest (2 min)

**Action:** Navigate to the map and set AOI to Dhaka

**Coordinates:**
- Latitude: 23.8103
- Longitude: 90.4125
- Radius: 25km (covers metropolitan area)

**Narrator:**
> "We begin by establishing Dhaka as our Area of Interest. With a population exceeding 22 million, this megacity presents significant complexity for situational awareness. Note that we're scoping to the city level where our data coverage is defensible."

---

## Step 2: Map Visualization & Satellite Imagery (3 min)

**Action:** Demonstrate map style switching

**Show:**
- Click **Map** button for standard road view
- Click **Satellite** for pure satellite imagery
- Click **Hybrid** for satellite with street labels

**Narrator:**
> "GuideRight integrates satellite imagery for enhanced terrain awareness. Notice how all tactical overlays - activity density, threat markers, and infrastructure indicators - automatically adapt their styling for visibility against both light and dark map backgrounds."

**Key Point:** Satellite view provides terrain context that street maps cannot - building density, open spaces, vegetation, and natural chokepoints become immediately visible.

---

## Step 3: Population Activity Density Grid (4 min)

**Action:** Enable the Population Density overlay and demonstrate click-to-sample

**Show the 40x40 Activity Grid:**
1. Enable the population layer from the lens selector
2. Point out the muted, earthy color palette
3. Explain the qualitative intensity bands

**Narrator:**
> "This activity density visualization represents human presence as spatial patterns and intensity - not discrete population counts. Notice we use qualitative descriptors rather than precise numbers: Concentrated, Elevated, Moderate, Dispersed, and Sparse. The muted color palette deliberately signals uncertainty - we're showing patterns, not claims."

**Click-to-Sample Demonstration:**
1. Click on a high-density cell in the grid
2. Walk through the Activity Sample panel:
   - **Grid Reference** - Coarse location indicator
   - **Activity Level** - Qualitative assessment (e.g., "Elevated")
   - **Egress** - Movement time estimates (qualitative)
   - **Access** - Vehicle movement difficulty (visual bar indicator)
   - **Context Note** - Operational considerations in restrained, advisory tone

**Narrator:**
> "When an analyst clicks any grid cell, GuideRight provides operational context - but notice the language: 'Context Note,' not 'Recommendation.' The system informs judgment without prescribing action. All indicators use muted styling to reinforce that these are estimates based on pattern analysis, not ground truth."

**Keyboard Navigation (Optional):**
- Press **G** to activate grid crosshair
- Use **Arrow keys** to navigate (Shift+Arrow for 3x speed)
- Press **Enter** to sample the current cell
- Press **Alt+P** to pin samples for briefing preparation

---

## Step 4: PMESII Analysis (5 min)

**Action:** Run PMESII analysis via chat or quick action buttons

**Sample Query:**
> "Provide a PMESII analysis for Dhaka, Bangladesh focusing on current stability indicators and infrastructure considerations following recent political unrest."

**Walk through each factor:**

| Factor | Demo Focus |
|--------|------------|
| **Political (P)** | Government response posture, opposition activity levels, institutional stability indicators |
| **Military (M)** | Security force deployments, law enforcement posture, paramilitary presence |
| **Economic (E)** | Market disruptions, business closures, garment industry status, port operations |
| **Social (S)** | Activity patterns, civil society response, population movement indicators |
| **Information (I)** | Media coverage, social media activity levels, information environment assessment |
| **Infrastructure (I)** | Healthcare facility status, transportation corridor access, telecommunications, utilities |

**Key Talking Points:**
- Show confidence scores for each factor
- Highlight where data is strong (infrastructure, economic) vs. uncertain (social patterns)
- Emphasize pattern-based interpretation, not point claims

---

## Step 5: Risk Assessment (3 min)

**Action:** Run risk assessment for the AOI

**Narrator:**
> "GuideRight calculates a composite risk score based on multiple weighted factors. Note that we're assessing *relative* risk posture - not predicting specific events."

**Demonstrate:**
- Overall risk score and level (e.g., MEDIUM-HIGH)
- Contributing factors breakdown
- Confidence level for the assessment
- Data freshness indicators

**Key Point:** 
> "The system explicitly communicates what we know, what we don't know, and how confident we are in each assessment."

---

## Step 6: Infrastructure Context (3 min)

**Action:** Show infrastructure layer on map

**Highlight:**
- Major hospitals and healthcare facilities
- Key transportation corridors (Dhaka-Chittagong highway, airport access)
- Critical infrastructure nodes
- Areas with limited infrastructure access

**Narrator:**
> "Infrastructure data tends to have higher reliability than real-time activity reporting. We lead with infrastructure context because it provides stable reference points for understanding access, movement, and potential chokepoints."

**Sample Query:**
> "What are the key infrastructure considerations affecting access and movement in Dhaka?"

---

## Step 7: Confidence & Uncertainty (3 min)

**Action:** Demonstrate confidence scoring details

**Show:**
- Evidence source types contributing to analysis
- Source diversity metrics
- Data freshness indicators (color-coded: green=fresh, yellow=stale, red=old)
- Explicit gaps identified

**Narrator:**
> "Every analytic conclusion is linked to its evidence basis. The confidence score reflects evidence count, source reliability, freshness, and PMESII dimension coverage. Where we have gaps, we say so explicitly."

**Sample Query:**
> "What are the main data gaps and uncertainties in our current assessment of Dhaka?"

---

## Step 8: Interactive Follow-Up - Demonstrating System Agility (5 min)

**Purpose:** Show how an analyst iteratively refines their understanding through conversational follow-up.

---

### Scenario: Analyst Drills Down on Activity Patterns

**Context Setup:**
> "Based on our activity density visualization, the analyst notices elevated patterns near the government complex. Let's watch how they use GuideRight to understand the context."

---

**TURN 1 - Initial Follow-Up**

**Analyst Query:**
> "I'm seeing elevated activity patterns near Motijheel. What factors might be contributing to this concentration?"

**System Response Highlights:**
- References commercial district activity
- Notes government complex proximity
- Provides pattern-level context (not crowd counts)
- Acknowledges uncertainty in real-time activity assessment

**Narrator:**
> "Notice the system responds with context, not claims. It doesn't say '15,000 people are gathered' - it describes patterns and contributing factors while acknowledging uncertainty."

---

**TURN 2 - Pivoting to Infrastructure**

**Analyst Query:**
> "What about egress routes from that area? If we needed to understand movement options, what would the infrastructure support?"

**System Response Highlights:**
- Identifies key corridors and chokepoints
- References bridge dependencies
- Notes infrastructure reliability vs. real-time traffic uncertainty
- Updates map focus to relevant area

**Narrator:**
> "The system maintains context while pivoting topics. Infrastructure data is higher confidence, so the response reflects that - more definitive on routes, less certain on current conditions."

---

**TURN 3 - Synthesis Request**

**Analyst Query:**
> "Based on the activity patterns and infrastructure context, where should I focus attention for the next 48 hours?"

**System Response Highlights:**
- Synthesizes activity patterns with infrastructure context
- Identifies areas warranting attention (not predictions)
- Links each to specific PMESII factors
- Provides aggregate confidence assessment

**Narrator:**
> "The system synthesizes without overstepping. 'Areas warranting attention,' not 'this will happen.' GuideRight supports analyst judgment; it doesn't replace it."

---

### Key Agility Takeaways

| Capability | What We Just Showed |
|------------|---------------------|
| **Contextual Memory** | System tracked the conversation thread across turns |
| **Dynamic Pivoting** | Analyst shifted from activity patterns to infrastructure seamlessly |
| **Confidence Adaptation** | Confidence levels adjusted based on data quality for each topic |
| **Map Integration** | Visualization updated to match conversational focus |
| **Pattern Language** | Consistent use of qualitative descriptors, not false precision |

---

## Step 9: Tactical UX Features (2 min)

**Action:** Highlight operational interface elements

**Demonstrate:**
- **Mission Clock** - Real-time Zulu (UTC) and local time display
- **Data Freshness Indicators** - Color-coded intel age tracking
- **Quick Action Buttons** - Alt+1 through Alt+5 for PMESII, Threats, SITREP, Infra, HUMINT
- **Keyboard Shortcuts** - Escape to clear, Enter to send

**Narrator:**
> "The interface is designed for fast-paced operational environments. Large readable fonts, keyboard navigation, and prominent status indicators keep analysts focused on the intelligence, not the interface."

---

## Closing (2 min)

**Narrator:**
> "To summarize what we've demonstrated:
> 
> 1. **City-level situational awareness** with satellite imagery integration
> 2. **Activity density visualization** using qualitative patterns, not false precision
> 3. **PMESII-structured analysis** for systematic factor assessment
> 4. **Infrastructure-first context** reflecting higher data reliability
> 5. **Explicit confidence levels** and uncertainty communication
> 6. **Analyst-in-the-loop reasoning** without predictive or prescriptive outputs
> 7. **Tactical keyboard navigation** for field and garrison environments
>
> GuideRight delivers transparent, explainable, confidence-qualified intelligence to support rapid decision-making in high-stakes operational environments."

---

## What This Demo Explicitly Avoided

- Precise population counts or crowd size claims
- Hyper-local assertions without defensible sourcing
- Predictive or prescriptive outputs
- Bright, alarm-colored visualizations implying false certainty
- Feature walkthroughs unrelated to the analytic question

---

## Technical Notes for Demo Operator

**Pre-Demo Checklist:**
- [ ] Verify OpenAI API key is configured
- [ ] Verify Google Maps API key is configured (for satellite imagery)
- [ ] Test PMESII analysis endpoint is responding
- [ ] Confirm population density overlay renders correctly
- [ ] Test click-to-sample functionality on the grid
- [ ] Verify keyboard shortcuts work (G for grid, Alt+1-5 for quick actions)
- [ ] Pre-cache Dhaka AOI analysis if needed for smooth demo

**Key Demo Points to Emphasize:**
- Muted color palette = uncertainty acknowledgment
- Qualitative labels = avoiding false precision
- "Context Note" not "Recommendation" = analyst-in-the-loop
- Pattern-based language throughout

**Fallback Options:**
- If API latency is high, use pre-generated analysis screenshots
- Map can fall back to OpenStreetMap if Google Maps unavailable
- Population grid works offline with deterministic generation

**Recommended Browser:** Chrome or Firefox, 1920x1080 resolution minimum

---

## Appendix: Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| Alt+1 | Quick PMESII query |
| Alt+2 | Quick Threats query |
| Alt+3 | Quick SITREP query |
| Alt+4 | Quick Infrastructure query |
| Alt+5 | Quick HUMINT query |
| G | Toggle grid crosshair navigation |
| Arrow Keys | Move crosshair (Shift for 3x speed) |
| Enter | Sample current grid cell |
| Alt+P | Pin current sample |
| Escape | Clear input / close panels |
