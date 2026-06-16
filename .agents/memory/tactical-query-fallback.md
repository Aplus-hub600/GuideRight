---
name: Tactical query fallback behavior
description: How processTacticalQuery handles OpenAI failures and the scenario-aware mock
---

# Tactical query fallback

`processTacticalQuery` (server/openai.ts) now returns `getMockTacticalResult` on **any**
exception from the OpenAI call — network stall, timeout, malformed JSON, provider error —
not only quota/429. It no longer re-throws.

**Why:** Live demos (SOFWERX) must never surface a raw error to the operator; a coherent
fallback keeps the screen on-script. Trade-off: real API failures are now silent (only logged),
so if you ever need errors to propagate (e.g. for alerting), this catch is where to change it.

**How to apply:** `getMockTacticalResult` is the single fallback. It has a scenario-specific
branch (Dhaka–Chittagong corridor) that returns a hardcoded SOF-format result so the demo's
movement-threat query looks identical whether the live model answers or not. Keep that branch's
facts in sync with the seeded scenario (SIGACT events in shared/scenarios.ts, social posts in
server/storage.ts) if the scenario data changes.
