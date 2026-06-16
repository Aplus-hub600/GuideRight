---
name: UI test agent timing is unreliable for short durations
description: Why to trust timestamped console logs over the testing subagent's stopwatch for sub-10s animations
---

The Playwright testing subagent cannot reliably measure short (<10s) elapsed time. Its
screenshots lag the real clock, so it will report a multi-second animation as "~1s" and
"fail" a duration check that is actually correct.

**Why:** It caught the boot sequence's INITIALIZING frame, then its "next" screenshot
(perceived as ~1s later) was actually several seconds later due to agent action latency,
making an 8.2s sequence look like it finished in 1s.

**How to apply:** To verify animation/sequence duration, emit `console.log("TAG", Date.now())`
at start and end, have the test agent read its own captured console logs and report the raw
numbers, then compute the delta yourself. Do not trust the agent's narrative timing. Remove
the diagnostic logs after measuring.
