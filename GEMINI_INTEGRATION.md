# Gemini Integration - Google Maps Grounding

## Overview

GuideRight now integrates **Google Gemini 2.5 Flash Lite** with **Google Maps grounding** capability for location-based tactical intelligence queries. This enables real-time analysis of infrastructure, facilities, and points of interest using Google's latest multimodal AI.

## Features

### 🗺️ Google Maps Grounding
- **Real-time location data**: Queries are grounded with actual Google Maps data
- **POI analysis**: Restaurants, hospitals, hotels, fuel stations, and more
- **Infrastructure intelligence**: Identify critical facilities within operational areas
- **Source attribution**: Every response includes Google Maps sources with titles and URIs

### 🤖 Gemini AI Capabilities
- **Multimodal analysis**: Text, image, and video processing
- **PMESII framework**: Structured intelligence analysis using Gemini Pro
- **Tactical reasoning**: Military-grade operational environment assessments
- **Streaming responses**: Fast, real-time intelligence delivery

## API Endpoints

### Location Intelligence Query
```http
POST /api/gemini/location
Content-Type: application/json

{
  "query": "What are the best hospitals within 10km?",
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on available intelligence for the specified location...",
  "groundingSources": [
    {
      "title": "Dhaka Medical College Hospital",
      "uri": "https://maps.google.com/?cid=..."
    }
  ],
  "hasGrounding": true
}
```

## Example Queries

### Infrastructure Analysis
```
"What critical infrastructure exists within 15km of current location?"
"Find all hospitals and medical facilities nearby"
"Locate fuel stations within walking distance"
```

### Tactical Planning
```
"Identify safe accommodation options in the area"
"What restaurants are available for team logistics?"
"Find pharmacies and medical supply points"
```

### Force Protection
```
"Analyze nearby facilities for operational planning"
"What are the key infrastructure vulnerabilities?"
"Identify potential safe houses and rally points"
```

## Smart Detection

The chat interface **automatically detects** location-based queries using keyword analysis:
- Infrastructure terms: restaurant, hotel, hospital, pharmacy, gas station
- Proximity terms: nearby, near me, within, close to, walking distance
- Search terms: places to, where can I, best, find, locate

When detected, queries are enhanced with Google Maps grounding for accurate, real-time data.

## Grounding Sources Display

Responses include **source attribution** when Google Maps data is used:
- Source titles (e.g., "Dhaka Medical College Hospital")
- Direct links to Google Maps locations
- Visual indicators in the chat interface

## Technical Architecture

### Backend (`server/gemini.ts`)
```typescript
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Process location query with Maps grounding
await ai.models.generateContent({
  model: "gemini-2.5-flash-lite",
  contents: query,
  config: {
    tools: [{ googleMaps: {} }],
    toolConfig: {
      retrievalConfig: {
        latLng: { latitude, longitude }
      }
    }
  }
});
```

### Routes (`server/routes.ts`)
- Smart location query detection in chat endpoint
- Dedicated `/api/gemini/location` endpoint
- Automatic fallback to mock responses for development

### Schema (`shared/schema.ts`)
```typescript
export const geminiLocationQuerySchema = z.object({
  query: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
```

## Development vs. Production

### With API Key (Production)
- Real-time Google Maps data
- Accurate POI information
- Live infrastructure analysis
- Full source attribution

### Without API Key (Development)
- Graceful fallback to mock responses
- Simulated tactical analysis
- Demo-ready intelligence output
- No service interruption

## Use Cases

### 1. Pre-Mission Planning
**Query:** "What are the critical medical facilities within 20km?"
- Identify hospitals for casualty evacuation
- Assess medical infrastructure capacity
- Plan medevac routes and timings

### 2. Logistics Coordination
**Query:** "Find all fuel stations and supply points nearby"
- Resource mapping for convoy operations
- Supply chain vulnerability assessment
- Alternative route planning

### 3. Force Protection
**Query:** "Analyze accommodation options for team security"
- Safe house identification
- Civilian infrastructure assessment
- Egress route planning

### 4. Cultural Intelligence
**Query:** "What restaurants and dining options are available?"
- Local infrastructure understanding
- Cultural engagement planning
- Team morale and logistics

## Configuration

### Required Secrets
```bash
GEMINI_API_KEY=AI...
```

Get your key from: https://aistudio.google.com/apikey

### Installation
```bash
npm install @google/genai
```

Already installed and configured in GuideRight.

## Benefits Over Traditional Intelligence

| Traditional Intel | Gemini + Maps Grounding |
|------------------|------------------------|
| Static, outdated data | Real-time Google Maps data |
| Manual research required | Instant AI-powered analysis |
| Limited POI coverage | Comprehensive location database |
| No source attribution | Full source links and metadata |
| Hours of analysis | Seconds to actionable intelligence |

## Next Steps

### Planned Enhancements
1. **Map marker integration**: Visualize grounding sources on tactical map
2. **Batch location analysis**: Multi-AOI infrastructure assessment
3. **Comparative analysis**: Multiple locations side-by-side
4. **Historical grounding**: Track infrastructure changes over time
5. **Custom POI categories**: Military-specific facility types

### Advanced Features
- **Gemini 2.5 Pro**: For complex PMESII analysis
- **Video analysis**: Process drone footage and surveillance
- **Image generation**: Tactical diagram creation
- **Multi-language**: Intelligence in 40+ languages

## Security Considerations

- API key stored in environment secrets (never in code)
- Requests logged for audit trail
- Rate limiting on location queries
- Source attribution for data provenance
- OPSEC-compliant responses (no sensitive data exposure)

## Demo Walkthrough

1. **Ask location question**: "What hospitals are within 15km?"
2. **System detects**: Location keywords trigger Gemini
3. **Maps grounding**: Query enhanced with Google Maps data
4. **AI analysis**: Gemini processes with tactical context
5. **Attributed response**: Intelligence with source links
6. **Map visualization**: Results displayed on tactical map (future)

---

**GuideRight + Gemini**: *Real-time tactical intelligence powered by Google's most advanced AI*
