# Palette's UX & Accessibility Journal

*Critical UX & accessibility learnings specific to FreshNex.*

## 2025-10-05 - Header Logo and Icon Navigation Accessibility
**Learning:** In header layouts, interactive logo elements are often wrapped in plain `<div>` elements with `onClick` handlers, which leaves them inaccessible to keyboard users (no tab focus) and invisible to screen readers.
**Action:** Always wrap clickable branding/logo headers in semantic `<button>` or `<a>` elements with explicit `aria-label` attributes and `focus-visible` focus rings for keyboard navigation.
