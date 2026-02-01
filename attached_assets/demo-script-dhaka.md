# GuideRight Demo Script
## Urban Instability & Infrastructure Awareness in Dhaka, Bangladesh

**Duration:** 20-25 minutes  
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

## Step 2: PMESII Analysis (5 min)

**Action:** Run PMESII analysis via chat or analysis panel

**Sample Query:**
> "Provide a PMESII analysis for Dhaka, Bangladesh focusing on current stability indicators and infrastructure considerations following recent political unrest."

**Walk through each factor:**

| Factor | Demo Focus |
|--------|------------|
| **Political (P)** | Government response posture, opposition activity levels, institutional stability indicators |
| **Military (M)** | Security force deployments, law enforcement posture, paramilitary presence |
| **Economic (E)** | Market disruptions, business closures, garment industry status, port operations |
| **Social (S)** | Protest activity patterns, civil society response, population movement indicators |
| **Information (I)** | Media coverage, social media activity levels, information environment assessment |
| **Infrastructure (I)** | Healthcare facility status, transportation corridor access, telecommunications, utilities |

**Key Talking Points:**
- Show confidence scores for each factor
- Highlight where data is strong (infrastructure, economic) vs. uncertain (social patterns)
- Emphasize pattern-based interpretation, not point claims

---

## Step 3: Risk Assessment (3 min)

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

## Step 4: Infrastructure Context (3 min)

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

## Step 5: Confidence & Uncertainty (3 min)

**Action:** Demonstrate confidence scoring details

**Show:**
- Evidence source types contributing to analysis
- Source diversity metrics
- Data freshness indicators
- Explicit gaps identified

**Narrator:**
> "Every analytic conclusion is linked to its evidence basis. The confidence score reflects evidence count, source reliability, freshness, and PMESII dimension coverage. Where we have gaps, we say so explicitly."

**Sample Query:**
> "What are the main data gaps and uncertainties in our current assessment of Dhaka?"

---

## Step 6: Interactive Follow-Up - Demonstrating System Agility (5 min)

**Purpose:** Show how an analyst iteratively refines their understanding through conversational follow-up. This demonstrates the system's ability to respond to evolving analytic needs in real-time.

---

### Scenario: Analyst Drills Down on Infrastructure Concern

**Context Setup:**
> "Based on our initial PMESII analysis, the analyst notices the Infrastructure factor shows potential vulnerabilities in healthcare access. Let's watch how they use GuideRight to drill deeper."

---

**TURN 1 - Initial Follow-Up**

**Analyst Query:**
> "The infrastructure assessment mentioned healthcare facility constraints. Can you break down which hospitals in Dhaka have the highest capacity and their current accessibility status?"

**System Response Highlights:**
- Lists major facilities (Dhaka Medical College, BIRDEM, Apollo)
- Shows accessibility factors (road access, proximity to protest areas)
- Provides confidence level for each data point
- Notes data gaps (e.g., "real-time capacity data unavailable")

**Narrator:**
> "Notice the system immediately pivots to the analyst's new focus area. It doesn't just repeat the original analysis - it provides targeted, relevant detail while maintaining transparency about what it doesn't know."

---

**TURN 2 - Refining the Question**

**Analyst Query:**
> "What about the routes between Hazrat Shahjalal Airport and these major hospitals? Are there any infrastructure chokepoints we should be aware of?"

**System Response Highlights:**
- Identifies key corridors (Airport Road, Mohakhali, Tejgaon)
- Flags known congestion points and bridge dependencies
- References transportation infrastructure reliability
- Updates map to highlight relevant routes

**Narrator:**
> "The system maintains conversational context - it knows we're still focused on the healthcare accessibility thread. The map updates dynamically to reflect the analyst's current focus."

---

**TURN 3 - Pivoting to a New Dimension**

**Analyst Query:**
> "Shifting focus - what's the current information environment around these infrastructure concerns? Is there social media activity indicating public awareness of healthcare access issues?"

**System Response Highlights:**
- Pivots to Information (I) and Social (S) factors
- Provides pattern-level assessment (elevated/baseline activity)
- Notes source limitations for social media monitoring
- Explicitly states confidence is LOWER for this assessment

**Narrator:**
> "Here's the agility - the analyst pivots from infrastructure to the information environment, and the system follows seamlessly. Critically, it adjusts confidence levels appropriately. Infrastructure data was HIGH confidence; social media patterns are MEDIUM-LOW. The system doesn't pretend to know more than it does."

---

**TURN 4 - Synthesis Request**

**Analyst Query:**
> "Based on everything we've discussed, what are the key areas where I should focus analytic attention over the next 48 hours?"

**System Response Highlights:**
- Synthesizes across the conversation thread
- Identifies 3-4 priority focus areas with rationale
- Links each to specific PMESII factors
- Explicitly frames as "areas warranting attention" NOT predictions
- Provides aggregate confidence assessment

**Narrator:**
> "The system synthesizes the entire conversation into actionable focus areas - but notice the language: 'areas warranting attention,' not 'this will happen.' GuideRight supports analyst judgment; it doesn't replace it."

---

### Key Agility Takeaways

| Capability | What We Just Showed |
|------------|---------------------|
| **Contextual Memory** | System tracked the conversation thread across 4 turns |
| **Dynamic Pivoting** | Analyst shifted from Infrastructure to Information seamlessly |
| **Confidence Adaptation** | Confidence levels adjusted based on data quality for each topic |
| **Map Integration** | Visualization updated to match conversational focus |
| **Synthesis** | System combined insights without overstepping into prediction |

---

## Step 7: Analyst-in-the-Loop Summary (1 min)

**Narrator:**
> "GuideRight supports analyst workflows through natural language queries. The system provides structured responses with cited sources - it doesn't make recommendations or predictions. The analyst remains in control of interpretation and decision-making. What you just saw was a realistic workflow: initial broad assessment, targeted drill-down, cross-domain pivot, and synthesis."

---

## Closing (2 min)

**Narrator:**
> "To summarize what we've demonstrated:
> 
> 1. **City-level situational awareness** with defensible data coverage
> 2. **PMESII-structured analysis** for systematic factor assessment
> 3. **Infrastructure-first context** reflecting higher data reliability
> 4. **Explicit confidence levels** and uncertainty communication
> 5. **Analyst-in-the-loop reasoning** without predictive or prescriptive outputs
>
> GuideRight delivers transparent, explainable, confidence-qualified intelligence to support rapid decision-making in high-stakes operational environments."

---

## What This Demo Explicitly Avoided

- Claims of precise protest or riot counts
- Hyper-local assertions without defensible sourcing
- Predictive or prescriptive outputs
- Feature walkthroughs unrelated to the analytic question

---

## Technical Notes for Demo Operator

**Pre-Demo Checklist:**
- [ ] Verify OpenAI API key is configured
- [ ] Verify Google Maps API key is configured (for satellite imagery)
- [ ] Test PMESII analysis endpoint is responding
- [ ] Pre-cache Dhaka AOI analysis if needed for smooth demo

**Fallback Options:**
- If API latency is high, use pre-generated analysis screenshots
- Map can fall back to OpenStreetMap if Google Maps unavailable

**Recommended Browser:** Chrome or Firefox, 1920x1080 resolution
