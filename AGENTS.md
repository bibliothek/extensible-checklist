# Agent Guidelines

- When making UI changes, always consider both light and dark themes. Use existing theme variables/tokens rather than hard-coded colors where possible, and verify contrast/readability in both modes.
- Reuse the common UI library/components/styles where applicable before adding new custom UI patterns.
- When changing styles or static assets that may be cached, increment the service worker cache version in `src/ExtensibleChecklist/wwwroot/sw.js`.
