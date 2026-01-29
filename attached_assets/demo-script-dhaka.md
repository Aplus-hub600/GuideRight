# GuideRight Demo Script
## Urban Instability & Infrastructure Awareness in Dhaka, Bangladesh

**Duration:** 15-20 minutes  
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

## Step 6: Analyst-in-the-Loop Queries (2 min)

**Action:** Show conversational analysis capability

**Sample Queries to Demonstrate:**
1. "Which areas of Dhaka show the highest infrastructure density?"
2. "What transportation corridors connect the airport to the diplomatic quarter?"
3. "Summarize the economic factors that could affect stability over the next 72 hours."

**Narrator:**
> "GuideRight supports analyst workflows through natural language queries. The system provides structured responses with cited sources - it doesn't make recommendations or predictions. The analyst remains in control of interpretation and decision-making."

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
