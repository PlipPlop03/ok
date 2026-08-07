---
inclusion: always
---

# Performance Guidelines

## Context Window Management

Keep context focused:
- Don't read entire large files when only a section is needed
- Use targeted searches over broad file reads
- Keep under 10 MCP servers enabled per project
- Under 80 tools active at a time

## Build Troubleshooting

If build fails:
1. Analyze error messages carefully
2. Fix incrementally (one error at a time)
3. Verify after each fix
4. Don't introduce architectural changes while fixing build errors

## Code Performance

- Prefer efficient algorithms (O(n log n) over O(n²) when possible)
- Minimize unnecessary re-renders in React (useMemo, useCallback)
- Use appropriate caching strategies
- Avoid N+1 queries in database operations
- Lazy load routes and heavy components
