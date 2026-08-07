---
inclusion: manual
---

# Code Review Checklist

When reviewing code (triggered by user asking for a code review):

## Security Checks (CRITICAL)

- Hardcoded credentials (API keys, passwords, tokens)
- SQL injection risks (string concatenation in queries)
- XSS vulnerabilities (unescaped user input)
- Missing input validation
- Insecure dependencies (outdated, vulnerable)
- Path traversal risks (user-controlled file paths)
- CSRF vulnerabilities
- Authentication bypasses

## Code Quality (HIGH)

- Large functions (>50 lines)
- Large files (>800 lines)
- Deep nesting (>4 levels)
- Missing error handling (try/catch)
- console.log statements
- Mutation patterns
- Missing tests for new code

## Performance (MEDIUM)

- Inefficient algorithms (O(n²) when O(n log n) possible)
- Unnecessary re-renders in React
- Missing memoization
- Large bundle sizes
- N+1 queries

## Best Practices (MEDIUM)

- TODO/FIXME without tickets
- Missing JSDoc for public APIs
- Accessibility issues (missing ARIA labels)
- Poor variable naming (x, tmp, data)
- Magic numbers without explanation
- Inconsistent formatting

## Review Output Format

For each issue found:
```
[SEVERITY] Issue Title
File: path/to/file.ts:line
Issue: Description
Fix: Suggested remediation
```

## Approval Criteria

- Approve: No CRITICAL or HIGH issues
- Warning: MEDIUM issues only (can merge with caution)
- Block: CRITICAL or HIGH issues found
