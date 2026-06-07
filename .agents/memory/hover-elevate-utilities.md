---
name: Hover elevation utilities
description: CSS utilities hover-elevate/active-elevate-2/toggle-elevate are referenced throughout the codebase but must be explicitly defined in index.css using pseudo-element approach.
---

The design system uses these classes extensively: `hover-elevate`, `active-elevate-2`, `no-default-hover-elevate`, `no-default-active-elevate`, `toggle-elevate`, `toggle-elevated`.

**Implementation**: Uses `::after` pseudo-element with white rgba overlay. Requires `position:relative` (set via `isolation:isolate`) and does NOT work with `overflow:hidden`.

**Why**: The pseudo-element approach composes with any background color without overriding it. A white overlay at 5% opacity creates a brightness increase that works on any dark surface.

**How to apply**: Add to `@layer utilities` in index.css. All six utility classes must be defined. If missing, hover/active interactions silently do nothing across the entire UI.

Key rule: NEVER add `hover:bg-*` or `hover:text-*` to buttons/badges/interactive elements. Use `hover-elevate` instead.
