# GuideRight

GuideRight is an intelligence-analysis and situational-awareness prototype with a map-based workspace, conversational analysis, source uploads, PMESII briefings, and commander/planner personas.

**Repository:** [Aplus-hub600/GuideRight](https://github.com/Aplus-hub600/GuideRight)

> **Read this first:** The application mixes provider-backed analysis, stored records, seeded scenarios, and mock fallbacks. A successful response does not necessarily mean live intelligence was retrieved or AI inference succeeded. Treat outputs as demonstration or analyst-assistance material requiring human verification—not validated operational guidance.

## Capabilities and boundaries

- Map-based area-of-interest exploration and intelligence overlays.
- Chat with streamed events, context references, and role-specific prompts.
- PMESII (Political, Military, Economic, Social, Information, Infrastructure), risk, and situational-report analysis.
- File ingestion, source records, graph nodes/edges, and assistant analysis sessions.
- GDELT intelligence queries, Gemini location analysis, and optional threat-intelligence integration.
- Seeded demonstration scenarios, SIGACT (significant activity) views, and briefing panels.

Planning personas can help explore planning questions. They are **not an implemented end-to-end MDMP workflow**, an approved CONOP/OPORD generator, or validated wargaming software.

## Backend engineer: start here

1. Read `server/index.ts` for bootstrapping, middleware, error handling, and server startup.
2. Read `server/routes.ts` for actual API contracts and route-specific failure behavior.
3. Read `shared/schema.ts` for Drizzle tables, Zod request schemas, and shared types.
4. Follow `server/storage.ts` → `server/storage-db.ts` → `server/db.ts` for persistence.
5. Compare `server/openai.ts`, `server/gemini.ts`, and `server/services/provider.ts`; they do not share identical fallback behavior.
6. Inspect `shared/scenarios.ts` and `client/src/context/scenario-context.tsx` before interpreting demo output as live data.

`replit.md` provides additional project background, but some descriptions are historical. In particular, **the active storage instance is `DatabaseStorage`**, not `MemStorage`. Trust the current code when documentation conflicts.

## Stack and layout

Node.js 20, TypeScript, Express 4, React 18, Vite 5, TanStack Query, Tailwind/Radix UI, Drizzle ORM, and PostgreSQL through the Neon serverless driver.

```text
client/src/             React application, panels, hooks, and contexts
server/index.ts         Express entry point; serves API and frontend
server/routes.ts        API routes and orchestration
server/storage.ts       Storage interface and active storage instance
server/storage-db.ts    Database-backed storage implementation
server/db.ts            Neon pool and Drizzle initialization
server/openai.ts        Chat, multimodal analysis, and fallback responses
server/gemini.ts        Gemini-backed analysis
server/services/        Provider, GDELT, population, threat, stress services
shared/schema.ts        Database schema, validation, and shared types
shared/scenarios.ts     Demonstration scenario data
drizzle.config.ts       Schema tooling configuration
```

Express serves both `/api/*` and the frontend on one port (default `5000`). Development mounts Vite; production serves the built frontend. Frontend requests should use relative API URLs.

## Development setup

### Prerequisites

- Node.js 20 and npm.
- A dedicated development PostgreSQL database reachable through the configured Neon serverless driver. A plain local PostgreSQL server is not automatically a drop-in replacement for its WebSocket transport.
- An OpenAI API key for the current startup path; the OpenAI clients are constructed at module load.
- Optional provider keys for the features you intend to exercise.

```bash
git clone https://github.com/Aplus-hub600/GuideRight.git
cd GuideRight
npm ci
```

Inject configuration through Replit Secrets or your local secret manager/process environment. **Do not commit credentials.** The current scripts do not automatically load a `.env` file, and the current `.gitignore` does not exclude one.

### Configuration

| Variable | Purpose / current behavior |
| --- | --- |
| `DATABASE_URL` | Required by both runtime database initialization and Drizzle tooling. Use a development database, not production. |
| `OPENAI_API_KEY` | Used by OpenAI clients instantiated at import time. Missing credentials may prevent startup; valid credentials do not guarantee quota or model access. |
| `GEMINI_API_KEY` | Enables Gemini-backed features, including location analysis. |
| `GOOGLE_MAPS_API_KEY` | Used by `/api/config/maps` to supply the browser map key. Restrict this key by allowed HTTP referrers and APIs; it is intentionally browser-visible. |
| `GTI_API_KEY` or `VIRUSTOTAL_API_KEY` | Optional threat-intelligence credentials; `GTI_API_KEY` takes precedence. |
| `PORT` | Server port; defaults to `5000`. |
| `NODE_ENV` | Set by the npm development/production scripts. |

The code reads **`DATABASE_URL`**, not `NEON_DATABASE_URL`. A differently named workspace secret will not be picked up automatically. Installed session/auth packages or a `SESSION_SECRET` alone do not establish authentication.

Once the environment is configured, initialize **only your dedicated development database**:

```bash
npm run db:push
npm run dev
```

Open the Replit preview, or `http://localhost:5000` when running locally.

`db:push` directly reconciles the database schema; it is not a reviewed, versioned production migration procedure. Review its proposed changes and never run it against a shared or production database without an approved migration and recovery plan. It does not import an existing deployment's data or promise a fully seeded demo database.

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Express with Vite in development. |
| `npm run check` | Run the TypeScript compiler checks. |
| `npm run build` | Build the frontend with Vite and backend with esbuild into `dist/`. |
| `npm start` | Run the built production server; requires a prior build. |
| `npm run db:push` | Apply schema changes to the configured database. |

There is currently no `npm test` script. Type checking and building are not substitutes for behavioral or integration tests.

## API orientation

The authoritative contracts are the route implementations and corresponding Zod schemas. Response envelopes differ across endpoints; there is no single uniform success/error shape.

| Route or family | Purpose |
| --- | --- |
| `POST /api/chat` | Chat using server-sent event framing over a POST response. |
| `GET /api/chat/history` | Stored chat history. |
| `POST /api/analysis/pmesii` | Legacy PMESII analysis path. |
| `POST /api/analyze/pmesii` | Separate provider-backed PMESII path. |
| `POST /api/analyze/sigacts` | Provider-backed SIGACT extraction. |
| `POST /api/analysis/file` | Multipart upload; field name `file`. |
| `/api/sources` | Uploaded source listing, detail, and deletion routes. |
| `/api/graph/nodes`, `/api/graph/edges` | Graph record operations. |
| `/api/assistant/sessions` | Analysis sessions, messages, runs, and execution. |
| `POST /api/risk/assess` | Risk assessment. |
| `/api/waypoints`, `/api/geotagged` | Map-related records. |
| `/api/intel/gdelt/*` | Query, refresh, live results, and refresh history. |
| `POST /api/gemini/location` | Gemini location analysis. |
| `GET /api/system/status` | Configuration-level status, **not a live dependency health check**. |
| `/api/stress/*` | Runtime stress/failure simulation controls; protect or disable before external use. |

### Minimal smoke checks

Against your running development instance:

```bash
# Replit shell: use the preview domain. For local development, use localhost.
BASE_URL="https://${REPLIT_DEV_DOMAIN}"
# BASE_URL="http://localhost:5000"

curl --fail-with-body "$BASE_URL/api/system/status"
curl --fail-with-body "$BASE_URL/api/chat/history"
curl --fail-with-body -N --max-time 90 \
  -X POST "$BASE_URL/api/chat" \
  -H 'Content-Type: application/json' \
  -d '{"query":"Summarize the available context."}'
```

The chat request writes history and may incur provider charges. Its output consists of `data: {...}` events, not one JSON document; handle completion and error events explicitly. Browser `EventSource` does not issue POST requests, so use a streaming fetch client.

`/api/system/status` infers provider availability from key presence and currently reports `database: true` without probing it. Use an actual database-backed route and provider call to verify those dependencies.

## Persistence and ingestion

- Runtime persistence uses `DatabaseStorage` and the schema in `shared/schema.ts`.
- Tables cover users, chat, analyses, risk, map records, weather/social records, uploaded sources, graphs, assistant sessions/runs, evidence, and GDELT cache/refresh records.
- `MemStorage` remains in the codebase but is not the active default or an automatic database-failure fallback.
- Uploads are buffered in memory with a **50 MB per-file limit**. Concurrent uploads can therefore create significant memory pressure.
- PDF parsing is currently commented out in the route module due to initialization issues. Do not assume every advertised file type has full extraction support.
- Cloning GitHub copies code and tracked assets, **not database contents or workspace secrets**. Arrange development access separately and avoid distributing production data.

## Demo data versus live analysis

These distinctions are important when debugging or demonstrating the system:

- `processTacticalQuery` in `server/openai.ts` returns mock/scenario-aware responses on provider failures, including quota, rate-limit, network, and parsing errors.
- The fallback includes a prepared corridor scenario. Receiving a detailed answer is not proof of live retrieval or successful inference.
- `/api/analyze/sigacts` and the separate provider-backed analysis paths can report degraded/unavailable states instead of returning the chat fallback.
- The SIGACT panel reads scenario context; the PMESII briefing panel has locally defined briefing content. Those panels are not evidence that the extraction APIs are working.
- Confidence values and generated reasoning require validation; they should not be presented as calibrated probabilities or independently verified evidence.
- Provider quotas and upstream availability change. Check them before a demo instead of treating a past successful run as a guarantee.

## Known engineering risks and first review priorities

This is a handoff checklist, not a claim that these controls already exist:

1. **Authentication and authorization:** The inspected Express bootstrap/routes do not establish an application-wide authentication boundary. Review all read/write routes, data ownership, and role enforcement before multi-user or sensitive use. UI personas are not security roles.
2. **Error handling:** The global Express error middleware sends a response and then rethrows the error, which can terminate the process. Review this along with async errors and SSE disconnect cleanup.
3. **Data provenance:** Clearly distinguish live, cached, seeded, and fallback results in API responses and UI. Preserve explicit provider failure information.
4. **Database evolution:** Establish reviewed migrations, backups, rollback procedures, and separate development/production access.
5. **Uploads and logging:** Add appropriate validation, resource controls, and retention policy. API logging currently includes portions of JSON response bodies; review sensitive-data exposure.
6. **Operational health:** Replace configuration-only status reporting with bounded dependency checks and add monitoring, timeouts, rate limits, and retries where appropriate.
7. **Regression coverage:** Add tests for request validation, persistence, provider outages, stream completion/disconnection, uploads, and scenario/live-data separation.

Google Maps' removed `visualization.HeatmapLayer` must not be reintroduced. The intel overlay uses circle overlays instead; preserve lifecycle cleanup and test toggling the layer.

## Contribution workflow

Use a feature branch and a pull request. Include:

- The user-visible or backend behavior being changed.
- Schema/configuration changes and any required migration steps.
- Verification performed, including known baseline failures.
- Whether results come from live providers, test fixtures, or fallback data.

Before proposing a change, run `npm run check` and `npm run build`, then exercise the affected route/UI with a development database. Keep secrets, private source material, database exports, and generated large artifacts out of commits. Avoid changing demo behavior silently.
